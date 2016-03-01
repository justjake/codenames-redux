import ExtendableError from 'es6-error';
import { includes } from 'lodash';

import HubotBot from './HubotBot';
import Clue from '../models/Clue';
import { createStore } from 'redux';
import botReducer, { lobbyForChannel } from './reducers';
import * as botActions from './actions';
import * as gameActions from '../actions';
import renderGame from '../views/renderGame';
import { playerByName } from '../utils';
import { PLAYER_TEAMS, SPYMASTER, RED, BLUE } from '../constants';
import LobbyDispatcher from '../LobbyDispatcher';
import { renderTeams } from './views';
import { CMD_HELP, CMD_BAD_COMMAND, CMD_PREFIX } from './constants';
import setUpGame from '../standalone-game';

// general commands
const CMD_SHOW = 'show';

// player management
const CMD_JOIN_LOBBY = 'join';
const CMD_LEAVE_LOBBY = 'leave';
// const CMD_SET_TEAM = 'set-team'; // nah, let's just use CMD_JOIN_LOBBY instead
const CMD_BECOME_SPYMASTER = 'become-spymaster';
const CMD_POPULATE = 'populate-lobby';

// channel commands
const CMD_ENABLE_IN_CHANNEL = 'enable-channel';
const CMD_DISBALE_IN_CHANNEL = 'disable-channel';
const CMD_RESET_LOBBY = 'reset-channel';

// game commands
const CMD_NEW_GAME = 'new-game';
const CMD_PASS = 'pass';
const CMD_GUESS = 'guess';
const CMD_GIVE_CLUE = 'give-clue';

const NEEDS_CHANNEL_TEXT = 'this command must be run in a channel';

const HELP_TEXT = `
The great and powerful Codenames bot interface.
see https://github.com/justjake/codenames-redux

To interact with me, type ${CMD_PREFIX} [command]
To get help with a command, type ${CMD_PREFIX} [command] --help

Setting up a game:

  1. do "${CMD_PREFIX} ${CMD_ENABLE_IN_CHANNEL}"
  2. red team: "${CMD_PREFIX} ${CMD_JOIN_LOBBY} ${RED}"
  2. blue team: "${CMD_PREFIX} ${CMD_JOIN_LOBBY} ${BLUE}"
  3. become spymaster: "${CMD_PREFIX} ${CMD_BECOME_SPYMASTER}"
  4. start the game: "${CMD_PREFIX} ${CMD_NEW_GAME}"

Playing:

  ${CMD_PREFIX} ${CMD_GIVE_CLUE} WORD GUESSES - give a clue
  ${CMD_PREFIX} ${CMD_GUESS} WORD - guess WORD for your team
  ${CMD_PREFIX} ${CMD_PASS} - pass on this phase
  ${CMD_PREFIX} ${CMD_SHOW} - show the current game state for this channel`;

const BLOCK_DELIM = '```';

function codeblock(contents) {
  return `${BLOCK_DELIM}\n${contents}\n${BLOCK_DELIM}\n`;
}

function s(something) {
  return JSON.stringify(something) || 'undefined';
}

class RequiresLobbyError extends ExtendableError {}
class RequiresPlayerError extends ExtendableError {}

export default class CodenamesHubot extends HubotBot {
  constructor(hubot) {
    super(hubot);
    this.help = HELP_TEXT;
    // TODO: boostrap from robot brain
    // TODO: persist state into robot brain (will have to hydrate the Boards)
    this.store = createStore(botReducer);

    // stateless commands
    this.addCommand(this.helpCommand, CMD_HELP);
    this.addCommand(this.badCommand, CMD_BAD_COMMAND);
    this.addCommand(this.show, CMD_SHOW);

    // lobby management
    this.addCommand(this.enable, CMD_ENABLE_IN_CHANNEL)
      .setHelp('start up Codenames in this channel, allowing people to join up and play games! You should run this command first. No arguments.');
    this.addCommand(this.disable, CMD_DISBALE_IN_CHANNEL)
      .setHelp('remove codenames play from the current channel');
    this.addCommand(this.resetLobby, CMD_RESET_LOBBY)
      .setHelp(`reset the current channel's codenames game lobby. the NULEAR OPTION.`);

    // membership management
    this.addCommand(this.joinTeam, CMD_JOIN_LOBBY)
        .setHelp(`use this command to join the game or switch teams. You must specify the team you want to join.`)
        .changesTeams();
    this.addCommand(this.leaveGame, CMD_LEAVE_LOBBY)
        .changesTeams();
    this.addCommand(this.becomeSpymaster, CMD_BECOME_SPYMASTER)
        .changesTeams();

    // game commands
    this.addCommand(this.newGame, CMD_NEW_GAME)
        .setHelp(`start a new codenames game! Run this command once you're satisfied with team ballance, etc.`)
        .changesGame();
    this.addCommand(this.guess, CMD_GUESS)
      .setHelp(`guess WORD. guess a word! Don't worry, if it's not a real word, nothing happens.`)
      .changesGame();
    this.addCommand(this.pass, CMD_PASS)
      .setHelp(`pass the current phase. Hopefully you can't do this for the other team =/`)
      .changesGame();
    this.addCommand(this.giveClue, CMD_GIVE_CLUE)
      .setHelp(`${CMD_GIVE_CLUE} WORD COUNT. Give a clue! Spymasters only.`)
      .changesGame();

    this.addCommand(this.testPopulateGame, CMD_POPULATE)
      .setHelp(`fill the lobby with dummy users so you can start a game right away.`)
      .changesTeams();
  }

  // :tada:
  run(res) {
    const prevState = this.store.getState();
    const { cmd, successful } = super.run(res);
    const newState = this.store.getState();

    // we let the regular error handler take care of things - dont need to
    // tell spymasters and stuff
    if (!successful) return;

    try {
      if (cmd._changesTeams) this.handleTeamChange(res, prevState, newState);
      if (cmd._changesGame) this.handleGameChange(res, prevState, newState);
    } catch (err) {
      res.send(`encountered error after running command "${cmd.name}" successfully.`);
      res.send(err.stack);
    }
  }

  guardLobby(channel, state = this.store.getState()) {
    const lobbyId = state.channelToLobbyId[channel];
    const lobby = state.lobbyStore.lobbies[lobbyId];

    if (!lobbyId) throw new RequiresLobbyError(`no lobbyId for channel ${channel}`);
    if (!lobby) throw new RequiresLobbyError(`no lobby for lobbyId ${lobbyId}`);

    const lobbyDispatcher = new LobbyDispatcher(lobbyId, this.store.dispatch);
    return { lobbyId, lobby, lobbyDispatcher };
  }

  guardPlayer(res, state = this.store.getState()) {
    const channel = this.guardChannel(res);
    const username = this.usernameOf(res);

    const result = this.guardLobby(channel, state);
    result.channel = channel;
    const player = playerByName(result.lobby.players, username);

    if (!player) throw new RequiresPlayerError(`No player for username ${s(username)}`);
    result.player = player;
    return result;
  }

  handleTeamChange(res, prevState, newState) {
    const channel = this.guardChannel(res);
    const oldLobby = this.guardLobby(channel, prevState).lobby;
    const newLobby = this.guardLobby(channel, newState).lobby;
    if (oldLobby.players === newLobby.players) {
      // didn't change
      res.reply(`your command should have changed your teams, but didn't. Try again? Ask @jake?`);
      return;
    }

    res.send("Roster changed. Here's the new one.");
    res.send(renderTeams(newLobby.players));
  }

  handleGameChange(res, prevState, newState) {
    const channel = this.guardChannel(res)
    const oldLobby = this.guardLobby(channel, prevState).lobby;
    const newLobby = this.guardLobby(channel, newState).lobby;

    if (oldLobby.game === newLobby.game) {
      res.reply(`your command should have changed the game, but didn't. Perhaps it is not your turn? Or something. I don't know.`);
      return;
    }

    const spymasters = newLobby.players.filter(p => p.role === SPYMASTER);
    const masterBoard = renderGame(newLobby, true);
    const publicBoard = renderGame(newLobby, false);
    spymasters.forEach(spymaster => { newLobby
      this.pm(spymaster.name, `Your codenames game in ${this.channelOf(res)} changed.`)
      this.pm(spymaster.name, `here is the new game state:`);
      this.pm(spymaster.name, masterBoard);
    });

    res.send(publicBoard)
  }

  // commands
  enable(argv, res) {
    const channel = this.guardChannel(res);
    const state = this.store.getState();

    console.log(`enable message in room`, channel);

    if (lobbyForChannel(state, channel)) {
      res.send("Silly you! codenames is already enabled in this channel.");
      return;
    }

    this.store.dispatch(botActions.createLobbyInChannel(channel));
    const lobbyId = this.store.getState().channelToLobbyId[channel];
    res.send(`created lobby ${s(lobbyId)} for channel ${s(channel)}`);
  }

  disable(argv, res) {
    const channel = this.guardChannel(res);
    const { lobbyId } = this.guardLobby(channel);

    this.store.dispatch(botActions.removeLobbyFromChannel(channel));
    this.store.dispatch(gameActions.destroyLobby(lobbyId));
    res.send(`removed lobby ${s(lobbyId)} from channel ${s(channel)}`);
  }

  helpCommand(argv, res) {
    res.send(this.renderHelp());
  }

  badCommand(argv, res) {
    res.reply(`unknown command (you asked for "${argv.allArgv._.join(' ')}")`);
    this.helpCommand(argv, res);
  }

  show(argv, res) {
    const channel = this.guardChannel(res);
    const { lobby } = this.guardLobby(channel);

    res.send(renderTeams(lobby.players));
    if (lobby.game) {
      res.send(renderGame(lobby, false));
      // TODO: render the full game for spymasters somehow
      // TODO: print team rosters
    } else {
      res.send(`no game in progress. Once you have enough players, start one with ${CMD_NEW_GAME}.`)
    }
  }

  joinTeam(argv, res) {
    const channel = this.guardChannel(res);
    const { lobby, lobbyDispatcher } = this.guardLobby(channel);
    const username = this.usernameOf(res);
    const player = playerByName(lobby.players, username);
    const team = argv._[0];

    if (!includes(PLAYER_TEAMS, team)) {
      res.send(`Sorry, can't add you as a player on team ${s(team)}`);
      res.send(`valid teams are ${s(PLAYER_TEAMS)}`);
      return
    }

    if (player) {
      lobbyDispatcher.removePlayer(username);
    }

    lobbyDispatcher.registerPlayer(username, team);
    res.reply(`Ok, you are on team ${team}`);
  }

  leaveGame(argv, res) {
    const { player, lobbyDispatcher } = this.guardPlayer(res);
    lobbyDispatcher.removePlayer(player.name);
    res.reply(`Ok, you're out of the game. Sorry to see you go.`);
  }

  becomeSpymaster(argv, res) {
    const { player, lobbyDispatcher } = this.guardPlayer(res);
    lobbyDispatcher.electSpymaster(player.name);
    res.reply(`Ok, you're now the spymaster of your team.`);
  }

  guess(argv, res) {
    const { player, lobbyDispatcher } = this.guardPlayer(res);
    const word = argv._[0];

    if (!word) {
      res.reply(`You need to guess a word`);
      return;
    }

    lobbyDispatcher.guess(player, word);
  }

  pass(argv, res) {
    const { player, lobbyDispatcher } = this.guardPlayer(res);
    // TODO: does this allow you to pass someone else's turn?
    lobbyDispatcher.skip(player);
  }

  giveClue(argv, res) {
    const { player, lobbyDispatcher } = this.guardPlayer(res);

    if (argv._.length !== 2) {
      res.reply(`Oops, you need to specify both a WORD and a NUMBER`);
      res.reply(`you have ${s(argv._)}`);
      return
    }

    const word = argv._[0];
    const count = Number(argv._[1]);
    const clue = new Clue(word, count);

    lobbyDispatcher.giveClue(player, clue);
  }

  newGame(argv, res) {
    const { player, lobbyDispatcher } = this.guardPlayer(res);
    lobbyDispatcher.startNewGame(player);
    res.reply("started a new game on your orders");
  }

  resetLobby(argv, res) {
    // TODO: allow resetting without a player???
    // TODO (all actions): SCOPE ACTIONS TO LOBBY OMG
    const channel = this.guardChannel(res);
    const { lobbyDispatcher } = this.guardLobby(channel);
    lobbyDispatcher.reset();
    res.reply("BLAMMO, reset the lobby to zippy-zap");
  }

  testPopulateGame(argv, res) {
    const { lobbyDispatcher } = this.guardLobby(this.guardChannel(res));
    setUpGame(lobbyDispatcher, false);
  }
}
