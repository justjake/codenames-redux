import Board from './models/Board';

function main() {
  const board = new Board();
  board.pick(board.wordsInBoard[0]);
  board.pick(board.wordsInBoard[1]);
  console.log(board.inspect());
}

main();
