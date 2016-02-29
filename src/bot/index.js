import ExtendableError from 'es6-error';
import { includes } from 'lodash';

import Bot from './Bot';
import Clue from '../models/Clue';
import { createStore } from 'redux';
import botReducer, { lobbyForChannel } from './reducers';
import * as botActions from './actions';
import * as gameActions from '../actions';
import renderGame from '../views/renderGame';
import { playerByName } from '../utils';
import { PLAYER_TEAMS } from '../constants';

// general commands
const CMD_HELP = 'help';
const CMD_BAD_COMMAND = 'bad-command';
const CMD_SHOW = 'show';

// player management
const CMD_JOIN_LOBBY = 'join';
const CMD_LEAVE_LOBBY = 'leave';
// const CMD_SET_TEAM = 'set-team'; // nah, let's just use CMD_JOIN_LOBBY instead
const CMD_BECOME_SPYMASTER = 'become-spymaster';

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

To interact with me, type !codenames [command]
To get help with a command, type !codenames [command] --help

Setting up a game:

  1. do "!codenames ${CMD_ENABLE_IN_CHANNEL}"
  2. red team: "!codenames ${CMD_JOIN_LOBBY} ${RED}"
  2. blue team: "!codenames ${CMD_JOIN_LOBBY} ${BLUE}"
  3. become spymaster: "!codenames ${CMD_BECOME_SPYMASTER}"
  4. start the game: "!codenames ${CMD_START_GAME}"

Playing:

  !codenames ${CMD_GIVE_CLUE} WORD GUESSES - give a clue
  !codenames ${CMD_GUESS} WORD - guess WORD for your team
  !codenames ${CMD_PASS} - pass on this phase
  !codenames ${CMD_SHOW} - show the current game state for this channel
`;

const BLOCK_DELIM = '```';

funciton s(something) {
  return JSON.stringify(something) || 'undefined';
}

class RequiresChannelError extends ExtendableError {}
class RequiresLobbyError extends ExtendableError {}

class CodenamesHubot extends Bot {
  constructor(hubot) {
    super();
    this.help = HELP_TEXT;
    this.robot = hubot;
    // TODO: boostrap from robot brain
    // TODO: persist state into robot brain (will have to hydrate the Boards)
    this.store = createStore(botReducer);

    this.addCommand(this.enable, CMD_ENABLE_IN_CHANNEL)
      .setHelp('start up Codenames in this channel, allowing people to join up and play games! You should run this command first. No arguments.');

    this.addCommand(this.disable, CMD_DISBALE_IN_CHANNEL)
      .setHelp('remove codenames play from the current channel');

    this.addCommand(this.help, CMD_HELP);
    this.addCommand(this.badCommand, CMD_BAD_COMMAND);
    this.addCommand(this.show, CMD_SHOW);
    this.addCommand(this.joinTeam, CMD_JOIN_LOBBY)
      .setHelp(`use this command to join the game or switch teams. You must specify the team you want to join.`);
    this.addCommand(this.leaveGame, CMD_LEAVE_LOBBY);
    this.addCommand(this.becomeSpymaster, CMD_BECOME_SPYMASTER);

    this.addCommand(this.guess, CMD_GUESS)
      .setHelp(`guess WORD. guess a word! Don't worry, if it's not a real word, nothing happens.`);
    this.addCommand(this.pass, CMD_PASS)
      .setHelp(`pass the current phase. Hopefully you can't do this for the other team =/`);

    this.addCommand(this.giveClue, CMD_GIVE_CLUE)
      .setHelp(`${CMD_GIVE_CLUE} WORD COUNT. Give a clue! Spymasters only.`);
  }

  pm(res, string) {
    // TODO: implement pms harder
    return this.robot.messageRoom(res.envelope.user.name, string)
  }

  channelOf(res) {
    // TODO: implement getting the channel of a Response.
    return res.envelope.room || null;
  }

  usernameOf(res) {
    return res.envelope.user.name;
  }

  guardChannel(res) {
    const channel = this.channelOf(res);
    if (channel) return channel;

    throw new RequiresChannelError();
  }

  guardLobby(channel) {
    const state = this.store.getState();
    const lobbyId = state.channelToLobbyId[channel];
    const lobby = state.lobbyStore.lobbies[lobby];

    if (!lobbyId) throw new RequiresLobbyError(`no lobbyId for channel ${channel}`);
    if (!lobby) throw new RequiresLobbyError(`no lobby for lobbyId ${lobbyId}`);

    return { lobbyId, lobby };
  }

  guardPlayer(res) {
    const channel = this.guardChannel(res);
    const username = this.usernameOf(res);

    const result = this.guardLobby(channel);
    result.channel = channel;
    const player = playerByName(result.lobby, username);

    if (!player) throw new RequiresPlayerError(`No player for username ${s(username)}`);
    result.player = player;
    return result;
  }

  enable(argv, res) {
    const channel = this.channelOf(res.envelope.room);
    const state = this.store.getState();

    console.log(`enable message in room`, channel);

    if (!channel) {
      // can't enable in a PM
      res.send("Sorry, I can't enable codenames in a PM, only in a real #channel.");
      return;
    }

    if (lobbyForChannel(state, channel)) {
      res.send("Silly you! codenames is already enabled in this channel.");
      return;
    }

    this.store.dispatch(botActions.createLobbyInChannel(channel));
    const lobbyId = this.store.getState().channelToLobbyId[channel];
    res.send(`created lobby ${lobbyId} for channel ${channel}`);
  }

  disable(argv, res) {
    const channel = this.channelOf(res);
    if (!channel) {
      res.send(NEEDS_CHANNEL_TEXT);
      return;
    }

    const state = this.store.getState();
    const lobbyId = this.store.channelToLobbyId[channel];

    if (lobbyId) {
      this.store.dispatch(botActions.removeLobbyFromChannel(channel));
      this.store.dispatch(gameActions.destroyLobby(lobbyId));
      res.send(`removed lobby ${lobbyId} from channel ${channel}`);
    } else {
      res.send(`could not find a lobby for channel ${channel}`);
    }
  }

  help(argv, res) {
    res.send(this.renderHelp());
  }

  badCommand(argv, res) {
    res.send(`unknown command (you asked for "${argv.allArgv._.join(' ')}")`);
    this.help(argv, res);
  }

  show(argv, res) {
    const channel = this.guardChannel(res);
    const { lobby } = this.guardLobby(channel);
    const view = renderGame(lobby, false);
    res.send(`${BLOCK_DELIM}\n${view}\n${BLOCK_DELIM}`);
    // TODO: render the full game for spymasters somehow
    // TODO: print team rosters
  }

  joinTeam(argv, res) {
    const channel = this.guardChannel(res);
    const { lobby } = this.guardLobby(channel);
    const username = this.usernameOf(res);
    const player = playerByName(lobby, username);
    const team = argv._[0];

    if (!includes(PLAYER_TEAMS, team)) {
      res.send(`Sorry, can't add you as a player on team ${s(team)}`);
      res.send(`valid teams are ${s(PLAYER_TEAMS)}`);
      return
    }

    if (player) {
      this.store.dispatch(gameActions.removePlayer(username));
    }

    this.store.dispatch(gameActions.registerPlayer(username, team));
    res.reply(`Ok, you are on team ${team}`);
  }

  leaveGame(argv, res) {
    const { player } = this.guardPlayer(res);
    this.store.dispatch(gameActions.removePlayer(player.name));
    res.reply(`Ok, you're out of the game. Sorry to see you go.`);
  }

  becomeSpymaster(argv, res) {
    const { player } = this.guardPlayer(res);
    this.store.dispatch(gameActions.electSpymaster(player.name));
    res.reply(`Ok, you're now the spymaster of your team.`);
  }

  guess(argv, res) {
    const { player } = this.guardPlayer(res);
    const word = argv._[0];

    if (!word) {
      res.reply(`You need to guess a word`);
      return;
    }

    this.store.dispatch(gameActions.guess(player))
  }

  pass(argv, res) {
    const { player } = this.guardPlayer(res);
    // TODO: does this allow you to pass someone else's turn?
    this.store.dispatch(gameActions.skip(player));
  }

  giveClue(argv, res) {
    const { player } = this.guardPlayer(res);

    if (argv._.length !== 2) {
      res.reply(`Oops, you need to specify both a WORD and a NUMBER`);
      res.reply(`you have ${s(argv._)}`);
      return
    }

    const word = argv._[0];
    const count = Number(argv._[1]);
    const clue = new Clue(word, count);

    this.store.dispatch(gameActions.giveClue(player, clue));
  }

  newGame(argv, res) {
    const { player } = this.guardPlayer(res);
    this.store.dispatch(gameActions.startNewGame(player));
    this.reply("started a new game on your orders");
  }

  resetLobby(argv, res) {
    // TODO: allow resetting without a player???
    // TODO (all actions): SCOPE ACTIONS TO LOBBY OMG
    const { player } = this.guardPlayer(res);
    this.store.dispatch(gameActions.reset(player));
    this.reply("BLAMMO, reset the lobby to zippy-zap");
  }
}
