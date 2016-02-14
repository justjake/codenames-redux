import Board from './models/Board';
import { KILL } from './constants';

function main() {
  const board = new Board();
  board.pick(board.wordsInBoard[0]);
  board.pick(board.wordsInBoard[1]);
  const kill = board.wordsInBoard.filter(w => board.teamOf(w) === KILL)[0]
  board.pick(kill);
  console.log(board.inspect());
  console.log(board.getDepleted());
}

main();
