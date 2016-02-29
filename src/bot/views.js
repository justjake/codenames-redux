import { PLAYER_TEAMS } from '../constants';

export function renderTeams(players) {
  return PLAYER_TEAMS.map(
    teamName => {
      const team = players.filter(p => p.team === teamName);
      return `Team ${teamName}:\n${}renderPlayerList(players)`;
    }).join('\n\n');
}

export function renderPlayerList(players) {
  return players
    .slice()
    .sort((a, b) => b.role.length - a.role.length)
    .map(renderPlayer)
    .join('\n');
}

export function renderPlayer(player) {
  return `${player.name} (${player.role})`
}
