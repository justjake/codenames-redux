import renderClue from './renderClue';
import {
  ofTeam,
  spymastersOf,
  latestClue,
} from '../utils';
import { GIVE_CLUE, GUESS, GAME_OVER, GUESSER } from '../constants';

export default function renderPrompt(lobby, mangleName = n => n) {
  const game = lobby.game;
  const teamName = game.team;

  if (game.phase === GIVE_CLUE) {
    const spymaster = spymastersOf(ofTeam(lobby.players, game.team))[0];
    return `spymaster ${mangleName(spymaster.name)} should give a clue to the ${teamName} team.`;
  }

  if (game.phase === GUESS) {
    const guessers = ofTeam(lobby.players, game.team).filter(p => p.role === GUESSER);
    const guessersList = guessers.map(p => mangleName(p.name)).join(', ');
    const clue = latestClue(game.clueHistory);
    if (game.remainingGuesses === 1) {
      return `players on the ${teamName} (${guessersList}) team should guess a word! They have 1 extra guess left.`
    }
    return `players on the ${teamName} (${guessersList}) team should guess a word! They have ${game.remainingGuesses-1} (+1) left for the clue ${clue ? renderClue(clue) : 'ZOMFG NO CLUE GIVEN???'}`
  }

  if (game.phase === GAME_OVER) {
    const winner = game.winner;
    const winningTeam = ofTeam(lobby.players, winner);
    const winningTeamList = winningTeam.map(p => mangleName(p.name)).join(', ');
    return `GAME OVER! Team ${winner} has won the game! Congratulations to ${winningTeamList}`;
  }

  return `the game is in an unknown state called "${game.phase}"`;
}
