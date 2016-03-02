import renderClue from './renderClue';
import {
  ofTeam,
  spymastersOf,
  latestClue,
} from '../utils';
import { GIVE_CLUE, GUESS } from '../constants';

export default function renderPrompt(lobby) {
  const game = lobby.game;
  const teamName = game.team;

  if (game.phase === GIVE_CLUE) {
    const spymaster = spymastersOf(ofTeam(lobby.players, game.team))[0];
    return `spymaster "${spymaster.name}" should give a clue to the ${teamName} team.`;
  }

  if (game.phase === GUESS) {
    const clue = latestClue(game.clueHistory);
    return `players on the ${teamName} team should guess a word! They have ${game.remainingGuesses} left for the clue ${clue ? renderClue(clue) : 'ZOMFG NO CLUE GIVEN???'}`
  }

  return `the game is in an unknown state called "${game.phase}"`;
}
