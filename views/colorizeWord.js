import chalk from 'chalk';

import { BLUE, RED, KILL, NEUTRAL } from '../constants';

export default function colorizeWord(word, team, isChosen) {
  let colorizer = x => x;
  if (team === BLUE) colorizer = isChosen ? chalk.bold.white.bgBlue : chalk.blue;
  if (team === RED) colorizer = isChosen ? chalk.bold.white.bgRed : chalk.red;
  if (team === KILL) colorizer = isChosen ? chalk.bold.white.bgBlack : chalk.black;
  if (team === NEUTRAL && isChosen) colorizer = chalk.bold.white.bgYellow;
  return colorizer(word);
}
