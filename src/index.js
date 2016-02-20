import Board from './models/Board';
import Clue from './models/Clue';
import { RED, BLUE, KILL,
         GIVE_CLUE, GUESS, SKIP, START_NEW_GAME,
       } from './constants';
import renderBoard from './views/renderBoard';
// TODO rename this file and render function
import renderEverything from './views/renderGame';
import { createStore } from 'redux';
import rootReducer from './reducers/root2';
import * as actions from './actions';
import sourceMapSupport from 'source-map-support';
import readline from 'readline';
import { playerByName } from './utils';
import {
  find,
  startsWith,
} from 'lodash';
import { UnknownWordError } from './errors';
import express from 'express';
import LobbyProxy from './LobbyProxy';
import { startServer } from './server';

// these are used as player names for the required 4 players to play a simple
// game via the readline UI.
const RED_SPYMASTER = 'red spymaster';
const BLUE_SPYMASTER = 'blue spymaster';
const RED_GUESSER = 'red guessers';
const BLUE_GUESSER = 'blue guessers';

// this is for playing a simple game on the curses UI.
function enableServer(store, port = 1337) {
  const app = express();
  app.get('/spymaster', (req, res) => {
    res.send(renderEverything(store.getState(), true));
  });

  app.get('/', (req, res) => {
    res.send(renderEverything(store.getState()));
  });

  app.get('/api/v0/all', (req, res) => {
    res.json(store.getState())
  });

  app.listen(port);
}

function enableReadline(store) {
  const knownCommands = [GIVE_CLUE, GUESS, SKIP, START_NEW_GAME];

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function promptForState(state) {
    const cmds = `known commands: ${JSON.stringify(knownCommands)}`;
    return `${cmds}\n${playerNameForState(state.game)} => `;
  }

  function setPrompt() {
    rl.setPrompt(promptForState(store.getState()));
  }

  function say(something) {
    const text = something.split("\n").map(line => line ? `<-- ${line}` : '').join('\n');
    console.log(text);
  }

  function render() {
    console.log(renderEverything(store.getState()));
    // TODO: put rl.prompt() in here?
  }

  // configure prompt
  store.subscribe(() => setPrompt());
  setPrompt();
  render();
  rl.prompt();

  rl.on('line', (line) => {
    const state = store.getState();
    const currentPlayerName = playerNameForState(state.game);
    const currentPlayer = playerByName(state.players, currentPlayerName);
    const { match, rest } = startsWithSplit(line, knownCommands);

    if (!match) {
      say(`I don't understand your command ${JSON.stringify(line)}`);
      render();
      rl.prompt();
      return;
    }

    // produce an action from the typed line
    let action;
    switch (match) {
    case SKIP:
      action = actions.skip(currentPlayer);
      break;

    case GIVE_CLUE:
      const [word, numToParse] = rest.split(/\s+/);
      const num = parseInt(numToParse, 10);
      if (Number.isNaN(num)) {
        say(`Clues must be ONE word, then ONE number, like "hello 3". ${JSON.stringify(numToParse)} is not a number. (${num})`);
        action = { type: 'NOTHING' };
        break;
      }
      const clue = new Clue(word, parseInt(num, 10));
      action = actions.giveClue(currentPlayer, clue);
      break;

    case GUESS:
      const [worder] = rest.split(/\s+/);
      action = actions.guess(currentPlayer, worder);
      break;

    case START_NEW_GAME:
      say('whoa nelly, you resettin the gamer');
      action = actions.startNewGame(currentPlayer);
      break;
    }

    try {
      store.dispatch(action);
    } catch (err) {
      if (err instanceof UnknownWordError) {
        say(`you guessed an unknown word ${err.message}. Please try again.`);
      } else {
        throw err;
      }
    }

    // re-render
    render();
    const newState = store.getState();
    if (state === newState) {
      say(`hmm, nothing changed after running your command. Perhaps your command is invalid in this state?\n`);
    }
    rl.prompt();
  });
}

// return an object containing { match, rest } of the first memeber of array
// that `str` starts with
function startsWithSplit(str, array) {
  const match = find(array, el => startsWith(str, el));
  if (!match) return { match: false, rest: false }
  return { match, rest: str.replace(match, '').trim() };
}

function playerNameForState(game) {
  if (game.team === BLUE) {
    if (game.phase === GIVE_CLUE) return BLUE_SPYMASTER;
    return BLUE_GUESSER;
  }
  if (game.team === RED) {
    if (game.phase === GIVE_CLUE) return RED_SPYMASTER;
    return RED_GUESSER;
  }
  throw new Error(`unknown phase ${JSON.stringify(game.phase)}`);
}

function playerMap(store) {
  const state = store.getState();
  const map = {};
  state.players.forEach(player => map[player.name] = player);
  return map;
}

function findLobbyId(state, ticket) {
  return state.ticketsToIds[ticket];
}

function main() {
  const ticket = 'i want a lobby please';
  const rootStore = createStore(rootReducer);
  rootStore.dispatch(actions.createLobby(ticket));
  const lobbyId = rootStore.getState().ticketsToIds[ticket];
  if (!ticket) throw new Error(`should have an id for ticket ${ticket} but have ${lobbyId}`);

  console.log(rootStore.getState(), lobbyId);

  // this is a proxy that dispatches scoped actions for us :)
  const store = new LobbyProxy(lobbyId, rootStore);

  // create all required players
  store.dispatch(actions.registerPlayer(RED_SPYMASTER, RED));
  store.dispatch(actions.registerPlayer(BLUE_SPYMASTER, BLUE));
  store.dispatch(actions.registerPlayer(RED_GUESSER, RED));
  store.dispatch(actions.registerPlayer(BLUE_GUESSER, BLUE));

  // assign spymasters
  store.dispatch(actions.electSpymaster(RED_SPYMASTER));
  store.dispatch(actions.electSpymaster(BLUE_SPYMASTER));

  const players = playerMap(store)

  // start the first game right away
  store.dispatch(actions.startNewGame(players[RED_SPYMASTER]))

  // enable single-game mode
  enableReadline(store);
  enableServer(store, 1337);

  // enable multi-game server
  startServer(store, 1338);
}

main();
