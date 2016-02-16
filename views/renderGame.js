import renderBoard from './renderBoard';
import renderClue from './renderClue';
import renderClueHistore from './renderClueHistory';
import {
  ofTeam,
  spymastersOf,
} from '../utils';
import { omit } from 'lodash';
import { GIVE_CLUE, GUESS } from '../constants';
import colorizeWord from './colorizeWord';

export default function renderEverything(rootState, showUnguessed) {
  const game = rootState.game;
  const history = renderClueHistore(game.clueHistory);
  const board = renderBoard(game.board, showUnguessed);
  const teamName = colorizeWord(game.team, game.team);

  let prompt = 'the game is in an unknown state.';
  if (game.phase === GIVE_CLUE) {
    const spymaster = spymastersOf(ofTeam(rootState.players, game.team))[0];
    prompt = `spymaster "${spymaster.name}" should give a clue to the ${teamName} team.`;
  }

  if (game.phase === GUESS) {
    const clue = latestClue(game.clueHistory);
    prompt = `players on the ${teamName} team should guess a word! They have ${game.remainingGuesses} left for the clue ${clue ? renderClue(clue) : 'ZOMFG NO CLUE GIVEN???'}`
  }

  return `${history}\n\n${board}\n\n${prompt}\n`;
}

function latestClue(clueHistory) {
  const last = clueHistory[clueHistory.length - 1];
  if (!last) return null;
  return last.clue;
}
