import renderClue from './renderClue';
import { PLAYER_TEAMS } from '../constants';

function renderClueList(clues) {
  if (!clues || clues.length === 0) return 'no clues yet.';
  return clues.map((clue, idx) => `${idx + 1}: ${renderClue(clue)}`).join("\n");
}

export default function renderClueHistore(clueHistory) {
  return PLAYER_TEAMS.map(teamName => {
    const team = clueHistory.filter(clue => clue.team === teamName).map(clue => clue.clue);
    return `${teamName} clues (in order given):\n${renderClueList(team)}`
  }).join("\n\n");
}
