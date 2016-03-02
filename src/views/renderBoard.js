import { longest, pad } from '../utils';
import consoleColorize from './colorizeWord';

export default function renderBoard(board, showUnguessedColors, colorizeWord = consoleColorize) {
  const maxLenWord = longest(board.getWords());
  const maxLen = maxLenWord.length;

  function formatWord(word) {
    const padded = pad(word, maxLen);
    const colorized = colorizeWord(padded, board.teamOf(word), board.statusOf(word));
    if (showUnguessedColors) return colorized;
    if (board.statusOf(word)) return colorized;
    return padded;
  }

  const grid = board.mapWordGrid(formatWord);
  return grid.map(row => row.join(' ')).join("\n")
}
