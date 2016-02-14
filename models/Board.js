import DECK from '../data/cards.json';
import chalk from 'chalk'

import {
  ROWS,
  COLS,
  SQUARES,
  RED,
  BLUE,
  NEUTRAL,
  KILL,
  KILLS,
  STARTING_TEAMS,
  SECOND_TEAMS,
  NEUTRALS,

  // for formatting the view
  GUESSER,
  SPYMASTER
} from '../constants';

import { fiddyFiddy, repeat, shuffled, pad } from '../utils';

/**
 * cards are stored in JSON as tuples of [String, String]
 * indicating the sides of the cards. we pick top and bottom for each
 */
function pickSide([top, bottom]) {
  if (fiddyFiddy()) {
    return top;
  }

  return bottom;
}

function makeKeyDeck(reds, blues, kills, total) {
  const neutrals = total - reds - blues - kills;
  return shuffled([].concat(
    repeat(RED, reds),
    repeat(BLUE, blues),
    repeat(KILL, kills),
    repeat(NEUTRAL, neutrals)
  ));
}

function pickWords(deck, count) {
  return shuffled(deck).slice(0, count).map(pickSide);
}

function layoutGrid(rows, cols, words) {
  if (words.length < rows * cols) {
    throw new Error(`not enough words for ${rows} x ${cols} grid (${words.length} words given)`)
  }

  const grid = [];
  const lookup = {}
  for (let r = 0; r < rows; r++) {
    const row = [];
    grid.push(row);
    for (let c = 0; c < cols; c++) {
      const word = words[(r * cols) + c];
      row[c] = word;
      lookup[word] = [r, c];
    }
  }

  return { grid, lookup };
}

export default class Board {
  constructor(words, redStarting = fiddyFiddy(), init = true) {
    // sometimes we're duping
    if (!init) return;
    this.init(words, redStarting);
  }

  init(words, redStarting) {
    // record the words this game was created with so we can get new words next time
    this.wordsInBoard = words || pickWords(DECK, SQUARES);

    this.words = layoutGrid(ROWS, COLS, this.wordsInBoard);
    this.remaining = {
      [RED]: redStarting ? STARTING_TEAMS : SECOND_TEAMS,
      [BLUE]: redStarting ? SECOND_TEAMS : STARTING_TEAMS,
      [KILL]: KILLS,
      [NEUTRAL]: this.wordsInBoard.length - STARTING_TEAMS - SECOND_TEAMS - KILLS,
    };
    this.startingTeam = redStarting ? RED : BLUE;

    // generate the key, which is the thinger in charge of telling us which word is on
    // who's side
    const keyDeck = makeKeyDeck(
      this.remaining[RED],
      this.remaining[BLUE],
      KILLS,
      this.wordsInBoard.length);
    this.key = layoutGrid(ROWS, COLS, keyDeck).grid;

    // picks will be filled in with team constants as words are picked out
    this.picks = layoutGrid(ROWS, COLS, repeat(null, SQUARES)).grid;
  }

  loc(word) {
    return this.words.lookup[word]
  }

  hasWord(word) {
    if (this.loc(word)) return true;
    return false;
  }

  teamOf(word) {
    const [row, col] = this.loc(word);
    return this.key[row][col];
  }

  statusOf(word) {
    const [row, col] = this.loc(word);
    return this.picks[row][col];
  }

  inspect() {
    return [`\n${GUESSER} sees:`, this.formatForRole(GUESSER),
            `\n${SPYMASTER} sees:`, this.formatForRole(SPYMASTER)].join("\n");
  }

  getDepleted() {
    [KILL, RED, BLUE].filter(team => this.remaining[team] === 0)[0];
  }

  // map over every cell in this.words.grid with cellFormatFn
  // join everything all the way around and make a nice grid of it
  format(cellFormatFn) {
    const grid = clone(this.words.grid);
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid.length; c++) {
        grid[r][c] = cellFormatFn(grid[r][c], r, c);
      }
    }

    return grid.map(row => row.join(' ')).join("\n")
  }

  format2(getColorizer) {
    const maxLenWord = longest(this.wordsInBoard);
    const maxLen = maxLenWord.length;

    const formatter = (word) => {
      const padded = pad(word, maxLen);
      const colorizer = getColorizer(word);
      return colorizer(padded);
    }

    return this.format(formatter)
  }

  formatForRole(role) {
    let getColorizer;
    if (role === GUESSER) getColorizer = x => this.guesserColorizerForWord(x)
    if (role === SPYMASTER) getColorizer = x => this.spymasterColorizerForWord(x)
    return this.format2(getColorizer);
  }

  spymasterColorizerForWord(word) {
    const team = this.teamOf(word);
    const chosen = this.statusOf(word) && true;
    let colorizer = x => x;
    if (team === BLUE) colorizer = chosen ? chalk.bold.white.bgBlue : chalk.blue;
    if (team === RED) colorizer = chosen ? chalk.bold.white.bgRed : chalk.red;
    if (team === KILL) colorizer = chosen ? chalk.bold.white.bgBlack : chalk.black;
    if (team === NEUTRAL && chosen) colorizer = chalk.bold.white.bgYellow;
    return colorizer;
  }

  guesserColorizerForWord(word) {
    const chosen = this.statusOf(word) && true;
    if (chosen) return this.spymasterColorizerForWord(word);
    return x => x;
  }

  // TODO: be acutally immutable instead of half-assing it in Game ruducer
  dup() {
    const dup = new Board(null, null, false);
    const datas = JSON.parse(JSON.stringify(this));
    Object.assign(dup, datas);
    return dup;
  }

  // omg mutations
  // it would be nice to do redux, but this sort of nested array shenanigans is super
  // annoying without immutable.js - we just have too much stuff going on for me to
  // want to spend time on it on an airplane
  setStatusOf(word, team) {
    const [row, col] = this.loc(word);
    this.picks[row][col] = team;
  }

  pick(word) {
    const team = this.teamOf(word);
    this.setStatusOf(word, team);

    // meddle with counters?
    this.remaining[team] -= 1;
  }
}

function longest(list) {
  return list.slice()
    .sort((a, b) => b.length - a.length)[0];
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
