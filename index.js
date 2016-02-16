import Board from './models/Board';
import { RED, BLUE, KILL } from './constants';
import renderBoard from './views/renderBoard';
import { createStore } from 'redux';
import rootReducer from './reducers/root';
import * as actions from './actions';
import sourceMapSupport from 'source-map-support';
//sourceMapSupport.install();

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
  const board = store.getState().game.board;
  viewBoard(board)
}

main();
