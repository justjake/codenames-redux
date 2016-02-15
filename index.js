import Board from './models/Board';
import { KILL } from './constants';
import renderBoard from './views/renderBoard';

function main() {
  const board = new Board();
  board.pick(board.wordsInBoard[0]);
  board.pick(board.wordsInBoard[1]);
  const kill = board.wordsInBoard.filter(w => board.teamOf(w) === KILL)[0]
  board.pick(kill);
  console.log('board - what guessers see');
  console.log(renderBoard(board));
  console.log('board - what spymasters see (all words fully colorized)');
  console.log(renderBoard(board, true));
  console.log(board.getDepleted());
}

main();
