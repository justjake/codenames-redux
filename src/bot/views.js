import { RED, BLUE, KILL, NEUTRAL, PLAYER_TEAMS } from '../constants';
import renderClueHistory from '../views/renderClueHistory';
import renderPrompt from '../views/renderPrompt';
import { longest, pad } from '../utils';

export function renderTeams(players) {
  return PLAYER_TEAMS.map(
    teamName => {
      const team = players.filter(p => p.team === teamName);
      return `Team ${teamName}:\n${renderPlayerList(team)}`;
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

export function emoji(name) {
  return `:${name}:`;
}

export function fixedwidth(string) {
  return '`' + string + '`'
}

export function card(team = null, picked = false) {
  const finalTeam = team || 'unknown';
  const emojiName = picked ? `cn-${finalTeam}-picked` : `cn-${finalTeam}`;
  return emoji(emojiName);
}

// guessers don't know about cards unless they are picked
export function guesserCard(team, picked) {
  if (!picked) return card();
  return card(team, picked);
}

// renders a legend listing all the things
export function renderLegend() {
  const cardTeams = [NEUTRAL, KILL, RED, BLUE];
  const tokens = [];
  tokens.push(`${card()} unknown (to guessers)`);
  cardTeams.forEach(team => [true, false].forEach(picked => {
    const isPicked = picked ? 'picked' : 'unpicked';
    tokens.push(
      `${card(team, picked)}: ${isPicked} ${team} card`
    )
  }));
  return tokens.join('\n');
}

export function renderBoard(board, showUnguessedColors) {
  const maxLenWord = longest(board.getWords());
  const maxLen = maxLenWord.length;

  function formatWord(word) {
    const iconizer = showUnguessedColors ? card : guesserCard;
    const icon = iconizer(board.teamOf(word), board.statusOf(word));
    const padded = pad(word, maxLen);

    return `${icon}${fixedwidth(padded)}`;
  }

  const grid = board.mapWordGrid(formatWord);
  return grid.map(row => row.join(' ')).join("\n");
}

export function renderGame(rootState, showUnguessed) {
  const game = rootState.game;
  const history = renderClueHistory(game.clueHistory);
  const board = renderBoard(game.board, showUnguessed);
  const prompt = renderPrompt(rootState);
  return `${history}\n${board}\n${prompt}`;
}
