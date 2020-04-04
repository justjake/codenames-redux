import ExtendableError from 'es6-error';
import { includes } from 'lodash';

import SlackBot from './SlackBot';
import Clue from '../models/Clue';
import botReducer, { lobbyForChannel } from './reducers';
import * as botActions from './actions';
import * as gameActions from '../actions';
import { playerByName } from '../utils';
import { PLAYER_TEAMS, SPYMASTER, RED, BLUE } from '../constants';
import LobbyDispatcher from '../LobbyDispatcher';
import { renderTeams, renderLegend, renderGame } from './views';
import { CMD_HELP, CMD_BAD_COMMAND, CMD_PREFIX } from './constants';
import setUpGame from '../standalone-game';
import pkg from '../../package.json';

// general commands
const CMD_SHOW = 'show';

// player management
const CMD_JOIN_LOBBY = 'join';
const CMD_LEAVE_LOBBY = 'leave';
// const CMD_SET_TEAM = 'set-team'; // nah, let's just use CMD_JOIN_LOBBY instead
const CMD_BECOME_SPYMASTER = 'become-spymaster';
const CMD_SHUFFLE_TEAMS = 'shuffle';
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
# codenames-redux ${pkg.version}
The great and powerful Codenames bot interface.
see https://github.com/justjake/codenames-redux

To interact with me, type ${CMD_PREFIX} [command]
To get help with a command, type ${CMD_PREFIX} [command] --help

## Setting up a game:

  1. do "${CMD_PREFIX} ${CMD_ENABLE_IN_CHANNEL}"
  2. red team: "${CMD_PREFIX} ${CMD_JOIN_LOBBY} ${RED}"
  2. blue team: "${CMD_PREFIX} ${CMD_JOIN_LOBBY} ${BLUE}"
  3. become spymaster: "${CMD_PREFIX} ${CMD_BECOME_SPYMASTER}"
  4. start the game: "${CMD_PREFIX} ${CMD_NEW_GAME}"

## Playing:

  ${CMD_PREFIX} ${CMD_GIVE_CLUE} WORD GUESSES - give a clue
  ${CMD_PREFIX} ${CMD_GUESS} WORD - guess WORD for your team
  ${CMD_PREFIX} ${CMD_PASS} - pass on this phase
  ${CMD_PREFIX} ${CMD_SHOW} - show the current game state for this channel

## Map Legend:

${renderLegend()}`;


function s(something) {
  return JSON.stringify(something) || 'undefined';
}

class RequiresLobbyError extends ExtendableError {}
class RequiresPlayerError extends ExtendableError {}

export default class CodenamesHubot extends SlackBot {
  constructor(store, hubot) {
    super(hubot);
    this.help = HELP_TEXT;
    // TODO: boostrap from robot brain
    // TODO: persist state into robot brain (will have to hydrate the Boards)
    this.store = store;

    // stateless commands
    this.addCommand(this.helpCommand, CMD_HELP, '?', `pass --here to display help in-channel`);
    this.addCommand(this.badCommand, CMD_BAD_COMMAND);
    this.addCommand(this.show, CMD_SHOW, 'status', 's');

    // lobby management
    this.addCommand(this.enable, CMD_ENABLE_IN_CHANNEL)
      .setHelp('start up Codenames in this channel, allowing people to join up and play games! You should run this command first. No arguments.');
    this.addCommand(this.disable, CMD_DISBALE_IN_CHANNEL)
      .setHelp('remove codenames play from the current channel');
    this.addCommand(this.resetLobby, CMD_RESET_LOBBY)
      .setHelp(`reset the current channel's codenames game lobby. the NULEAR OPTION.`);

    // membership management
    this.addCommand(this.joinTeam, CMD_JOIN_LOBBY)
        .setHelp(`use this command to join the game or switch teams. You must specify the team you want to join.`);
    this.addCommand(this.leaveGame, CMD_LEAVE_LOBBY);
    this.addCommand(this.becomeSpymaster, CMD_BECOME_SPYMASTER);
    this.addCommand(this.shufflePlayers, CMD_SHUFFLE_TEAMS)
        .changesTeams();
    this.addCommand(this.shufflePlayers, CMD_SHUFFLE_TEAMS)
        .changesTeams();

    // game commands
    this.addCommand(this.newGame, CMD_NEW_GAME)
        .setHelp(`start a new codenames game! Run this command once you're satisfied with team balance, etc.`)
        .changesGame();
    this.addCommand(this.guess, CMD_GUESS)
      .setHelp(`guess WORD. guess a word! Don't worry, if it's not a real word, nothing happens.`)
      .changesGame();
    this.addCommand(this.pass, CMD_PASS, 'skip')
      .setHelp(`pass the current phase.`)
      .changesGame();
    this.addCommand(this.sudoPass, 'sudo-pass')
      .setHelp(`pass the current phase. Hopefully you don't do this for the other team =/`)
      .changesGame();
    this.addCommand(this.giveClue, CMD_GIVE_CLUE)
      .setHelp(`${CMD_GIVE_CLUE} WORD COUNT. Give a clue! Spymasters only.`)
      .changesGame();

    // test stuff
    this.addCommand(this.testPopulateGame, CMD_POPULATE)
      .setHelp(`fill the lobby with dummy users so you can start a game right away.`)
      .changesTeams();
    this.addCommand(this.testGameUp, 'game-up')
      .setHelp('starts up a game');
  }

  // :tada:
  run(req, res) {
    const prevState = this.store.getState();
    const { cmd, successful } = super.run(req, res);
    const newState = this.store.getState();

    // we let the regular error handler take care of things - dont need to
    // tell spymasters and stuff
    if (!successful) return res.send();

    try {
      if (cmd._changesTeams) this.handleTeamChange(req, res, prevState, newState);
      if (cmd._changesGame) this.handleGameChange(req, res, prevState, newState);
    } catch (err) {
      res.text(`encountered error after running command "${cmd.name}" successfully.`);
      res.text(err.stack);
    }

    // important - ends the request and sends all buffered messages to the clients
    res.send();
  }

  guardLobby(channel, state = this.store.getState()) {
    const lobbyId = state.channelToLobbyId[channel];
    const lobby = state.lobbyStore.lobbies[lobbyId];

    if (!lobbyId) throw new RequiresLobbyError(`no lobbyId for channel ${channel}`);
    if (!lobby) throw new RequiresLobbyError(`no lobby for lobbyId ${lobbyId}`);

    const lobbyDispatcher = new LobbyDispatcher(lobbyId, this.store.dispatch);
    return { lobbyId, lobby, lobbyDispatcher };
  }

  guardPlayer(req, state = this.store.getState()) {
    const channel = this.guardChannel(req);
    const username = this.usernameOf(req);

    const result = this.guardLobby(channel, state);
    result.channel = channel;
    const player = playerByName(result.lobby.players, username);

    if (!player) throw new RequiresPlayerError(`No player for username ${s(username)}. Try "cn join" first.`);
    result.player = player;
    return result;
  }

  handleTeamChange(req, res, prevState, newState) {
    const channel = this.guardChannel(req);
    const oldLobby = this.guardLobby(channel, prevState).lobby;
    const newLobby = this.guardLobby(channel, newState).lobby;
    if (oldLobby.players === newLobby.players) {
      // didn't change
      res.text(`your command should have changed your teams, but didn't. Try again? Ask @jake?`);
      return;
    }

    res.text("Roster changed. Here's the new one.");
    res.text(renderTeams(newLobby.players));
  }

  handleGameChange(req, res, prevState, newState) {
    const channel = this.guardChannel(req)
    const oldLobby = this.guardLobby(channel, prevState).lobby;
    const newLobby = this.guardLobby(channel, newState).lobby;

    if (oldLobby.game === newLobby.game) {
      res.text(`your command should have changed the game, but didn't. Perhaps it is not your turn? Or something. I don't know.`);
      return;
    }

    const currentGame = newLobby.game;
    const spymasters = newLobby.players
      .filter(p => p.role === SPYMASTER && (!currentGame || !oldLobby.game || p.team === currentGame.team))
      .map(p => p.name);
    const masterBoard = renderGame(newLobby, true, true);
    const publicBoard = renderGame(newLobby, false, true);

    // first do the public board, since buffered messages take time to post
    res.text(publicBoard);

    // then tell the spymasters if action is required from them
    if (masterBoard.includes('should give a clue')) {
      res.text(`Your codenames game in ${this.channelOf(req)} changed.`, spymasters);
      res.text(masterBoard, spymasters);
    }
  }

  // commands
  enable(argv, req, res) {
    const channel = this.guardChannel(req);
    const state = this.store.getState();

    console.log(`enable message in room`, channel);

    if (lobbyForChannel(state, channel)) {
      res.text("Silly you! codenames is already enabled in this channel.");
      return;
    }

    this.store.dispatch(botActions.createLobbyInChannel(channel));
    const lobbyId = this.store.getState().channelToLobbyId[channel];
    res.text(`created lobby ${s(lobbyId)} for channel ${s(channel)}`);
  }

  disable(argv, req, res) {
    const channel = this.guardChannel(req);
    const { lobbyId } = this.guardLobby(channel);

    this.store.dispatch(botActions.removeLobbyFromChannel(channel));
    this.store.dispatch(gameActions.destroyLobby(lobbyId));
    res.text(`removed lobby ${s(lobbyId)} from channel ${s(channel)}`);
  }

  helpCommand(argv, req, res) {
    const txt = this.renderHelp();
    if (argv.here) {
      res.text(txt);
    } else {
      if (this.channelOf(req)) res.reply(`help is coming to you via a PM`);
      res.text(txt, this.usernameOf(req));
    }
  }

  badCommand(argv, req, res) {
    res.text(`unknown command (you asked for "${argv.allArgv._.join(' ')}")`);
    res.text(`known commands:\n${this.renderCommands()}`);
  }

  show(argv, req, res) {
    const channel = this.guardChannel(req);
    const { lobby } = this.guardLobby(channel);
    const username = this.usernameOf(req);
    const player = playerByName(lobby.players, username);

    res.text(renderTeams(lobby.players));
    if (lobby.game) {
      res.text(renderGame(lobby, false));
      // send the board to the spymaster
      if (player && player.role === SPYMASTER) {
        const gameText = renderGame(lobby, true);
        if (gameText.includes('should give a clue')) {
          res.text(gameText, player.name);
        }
      }
    } else {
      res.text(`No game in progress. Once you have enough players, start one with ${CMD_NEW_GAME}.`)
    }
  }

  shufflePlayers(argv, req, res) {
    const channel = this.guardChannel(req);
    const { lobby, lobbyDispatcher } = this.guardLobby(channel);

    if (!lobby.game || lobby.game.winner) {
      lobbyDispatcher.shufflePlayers();
      res.reply('Shuffled teams.');
    } else {
      res.reply('Did not shuffle. Game in progress.');
    }
  }

  numPlayersOnTeam(lobby, team) {
    return lobby.players.filter(p => p.team === team).length;
  }

  joinTeam(argv, req, res) {
    const channel = this.guardChannel(req);
    const { lobby, lobbyDispatcher } = this.guardLobby(channel);
    const username = this.usernameOf(req);
    const player = playerByName(lobby.players, username);
    let team;
    if (argv._[0] !== RED && argv._[0] !== BLUE) {
      if (this.numPlayersOnTeam(lobby, RED) > this.numPlayersOnTeam(lobby, BLUE)) {
        team = BLUE;
      }
      else {
        team = RED;
      }
    }
    else {
      team = argv._[0];
    }

    if (!includes(PLAYER_TEAMS, team)) {
      res.reply(`Sorry, can't add you as a player on team ${s(team)}`);
      res.reply(`valid teams are ${s(PLAYER_TEAMS)}`);
      return
    }

    if (player) {
      lobbyDispatcher.removePlayer(username);
    }

    lobbyDispatcher.registerPlayer(username, team);
    res.reply(`Ok, you are on team ${team}`);
  }

  leaveGame(argv, req, res) {
    const { player, lobbyDispatcher } = this.guardPlayer(req);
    lobbyDispatcher.removePlayer(player.name);
    res.reply(`Ok, you're out of the game. Sorry to see you go.`);
  }

  becomeSpymaster(argv, req, res) {
    const { player, lobbyDispatcher } = this.guardPlayer(req);
    lobbyDispatcher.electSpymaster(player.name);
    res.reply(`Ok, you're now the spymaster of your team.`);
  }

  guess(argv, req, res) {
    const { player, lobbyDispatcher } = this.guardPlayer(req);
    // words like LOCH NESS need a space.
    const word = argv._.join(' ');

    if (!word) {
      res.reply(`You need to guess a word`);
      return;
    }

    lobbyDispatcher.guess(player, word);
  }

  pass(argv, req, res) {
    const { player, lobbyDispatcher } = this.guardPlayer(req);
    // TODO: does this allow you to pass someone else's turn?
    lobbyDispatcher.skip(player);
  }

  sudoPass(argv, req, res) {
    const { lobby, lobbyDispatcher } = this.guardLobby(this.guardChannel(req));
    const superuser = {name: 'superuser', team: lobby.game.team};
    lobbyDispatcher.skip(superuser);
  }

  giveClue(argv, req, res) {
    const { player, lobbyDispatcher } = this.guardPlayer(req);

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

  newGame(argv, req, res) {
    const { player, lobbyDispatcher } = this.guardPlayer(req);
    lobbyDispatcher.startNewGame(player);
    res.reply("started a new game on your orders");
  }

  resetLobby(argv, req, res) {
    // TODO: allow resetting without a player???
    // TODO (all actions): SCOPE ACTIONS TO LOBBY OMG
    const channel = this.guardChannel(req);
    const { lobbyDispatcher } = this.guardLobby(channel);
    lobbyDispatcher.reset();
    res.reply("BLAMMO, reset the lobby to zippy-zap");
  }

  testPopulateGame(argv, req, res) {
    const { lobbyDispatcher } = this.guardLobby(this.guardChannel(req));
    setUpGame(lobbyDispatcher, false);
  }

  testGameUp(argv, req, res) {
    this.enable(argv, req, res);
    this.testPopulateGame(argv, req, res);
    this.joinTeam({_: ['red']}, req, res);
    this.newGame(argv, req, res);
  }

  testLeaveChannel(argv, req, res) {
    const channelToLeave = argv._[0] || this.guardChannel(req);

  }
}
