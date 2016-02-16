import renderBoard from './renderBoard';
import renderClue from './renderClue';
import renderClueHistore from './renderClueHistory';
import {
  ofTeam,
  spymastersOf,
} from '../utils';
import { omit } from 'lodash';
import { GIVE_CLUE, GUESS } from '../constants';

export default function renderEverything(rootState, showUnguessed) {
  const game = rootState.game;
  const history = renderClueHistore(game.clueHistory);
  const board = renderBoard(game.board, showUnguessed);
  let prompt = 'a bepis is occurring';
  if (game.phase === GIVE_CLUE) {
    const spymaster = spymastersOf(ofTeam(rootState.players, game.team))[0];
    prompt = `spymaster "${spymaster.name}" should give a clue to the ${game.team} team.`;
  }
  if (game.phase === GUESS) {
    const clue = game.clueHistory[game.clueHistory.length - 1]
    prompt = `players on the ${game.team} should guess a word! They have ${game.remainingGuesses} left for the clue ${clue ? renderClue(clue) : 'ZOMFG NO CLUE GIVEN???'}`
  }
  return `${history}\n\n${prompt}\n\n${board}`;
}
