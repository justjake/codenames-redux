import Board from './models/Board';
import Clue from './models/Clue';
import { RED, BLUE, KILL,
         GIVE_CLUE, GUESS, SKIP, START_NEW_GAME,
       } from './constants';
import renderBoard from './views/renderBoard';
// TODO rename this file and render function
import renderEverything from './views/renderGame';
import { createStore } from 'redux';
import rootReducer from './reducers/root';
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

function enableServer(store, port = 1337) {
  const app = express();
  app.get('/spymaster', (req, res) => {
    res.send(renderEverything(store.getState(), true));
  });

  app.get('/', (req, res) => {
    res.send(renderEverything(store.getState()));
  });

  app.listen(port);
}

function enableReadline(store) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function promptForState(state) {
    return `${playerNameForState(state.game)} => `;
    return state.game.phase;
  }

  function setPrompt() {
    rl.setPrompt(promptForState(store.getState()));
  }

  store.subscribe(() => setPrompt());
  setPrompt();

  const knownCommands = [GIVE_CLUE, GUESS, SKIP, START_NEW_GAME];
  console.log(`Commands:`, JSON.stringify(knownCommands));

  rl.prompt();

  rl.on('line', (line) => {
    const state = store.getState();
    const currentPlayerName = playerNameForState(state.game);
    const currentPlayer = playerByName(state.players, currentPlayerName);
    const { match, rest } = startsWithSplit(line, knownCommands);

    if (!match) {
      console.log('-- i dun understand');
      rl.prompt();
      return;
    }

    //console.log(`-- todo: evaluate command "${match}" with args "${rest}"`);
    let action;
    switch (match) {
    case SKIP:
      action = actions.skip(currentPlayer);
      break;
    case GIVE_CLUE:
      const [word, num] = rest.split(/\s+/);
      const clue = new Clue(word, parseInt(num, 10));
      action = actions.giveClue(currentPlayer, clue);
      break;
    case GUESS:
      const [worder] = rest.split(/\s+/);
      action = actions.guess(currentPlayer, worder);
      break;
    case START_NEW_GAME:
      console.log('whoa nelly, you resettin the gamer');
      action = actions.startNewGame(currentPlayer);
      break;
    }

    try {
      store.dispatch(action);
    } catch (err) {
      if (err instanceof UnknownWordError) {
        console.log(`you guessed an unknown word ${err.message}. Please try again.`);
      } else {
        throw err;
      }
    }

    const newState = store.getState();

    if (state === newState) {
      console.log(`hmm, nothing changed. Perhaps your command is invalid in this state?\n`);
    }

    console.log(`Commands:`, JSON.stringify(knownCommands));
    console.log(renderEverything(store.getState()));

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

function testBoard() {
  const board = new Board();
  board.pick(board.wordsInBoard[0]);
  board.pick(board.wordsInBoard[1]);
  const kill = board.wordsInBoard.filter(w => board.teamOf(w) === KILL)[0]
  board.pick(kill);
  viewBoard(board);
}

function viewBoard(board) {
  console.log('board - what guessers see');
  console.log(renderBoard(board));
  console.log('board - what spymasters see (all words fully colorized)');
  console.log(renderBoard(board, true));
  console.log(board.getDepleted());
}

const RED_SPYMASTER = 'red spymaster';
const BLUE_SPYMASTER = 'blue spymaster';
const RED_GUESSER = 'red guessers';
const BLUE_GUESSER = 'blue guessers';

function playerNameForState(game) {
  if (game.team === BLUE) {
    if (game.phase === GIVE_CLUE) return BLUE_SPYMASTER;
    return BLUE_GUESSER;
  }
  if (game.team === RED) {
    if (game.phase === GIVE_CLUE) return RED_SPYMASTER;
    return RED_GUESSER;
  }
  throw new Error('wat');
}

function playerMap(store) {
  const state = store.getState();
  const map = {};
  state.players.forEach(player => map[player.name] = player);
  return map;
}

function main() {
  const store = createStore(rootReducer);
  // create all required players
  store.dispatch(actions.registerPlayer(RED_SPYMASTER, RED));
  store.dispatch(actions.registerPlayer(BLUE_SPYMASTER, BLUE));
  store.dispatch(actions.registerPlayer(RED_GUESSER, RED));
  store.dispatch(actions.registerPlayer(BLUE_GUESSER, BLUE));

  // assign spymasters
  store.dispatch(actions.electSpymaster(RED_SPYMASTER));
  store.dispatch(actions.electSpymaster(BLUE_SPYMASTER));

  const players = playerMap(store);

  // start game
  store.dispatch(actions.startNewGame(playerMap[RED_SPYMASTER]))

  // print the baord
  const state = store.getState();
  console.log(renderEverything(state));
  const board = store.getState().game.board;
  viewBoard(board)

  enableReadline(store);
  enableServer(store);
}

main();
