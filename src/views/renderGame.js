import renderBoard from './renderBoard';
import renderClue from './renderClue';
import renderClueHistore from './renderClueHistory';
import renderPrompt from './renderPrompt';
import {
  ofTeam,
  spymastersOf,
  latestClue,
} from '../utils';
import { omit } from 'lodash';
import { GIVE_CLUE, GUESS } from '../constants';
import colorizeWord from './colorizeWord';

export default function renderEverything(rootState, showUnguessed) {
  const game = rootState.game;
  const history = renderClueHistore(game.clueHistory);
  const board = renderBoard(game.board, showUnguessed);
  const prompt = renderPrompt(game);
  return `${history}\n\n${board}\n\n${prompt}\n`;
}
