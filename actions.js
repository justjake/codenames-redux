import {
  GIVE_CLUE,
  GUESS,
  SKIP,

  REGISTER_PLAYER,
  ELECT_SPYMASTER,
  START_NEW_GAME,
  RESET
} from './constants';

// game action creators
export function giveClue(player, clue) {
  return {
    type: GIVE_CLUE,
    player,
    clue,
  };
}

export function guess(player, word) {
  return {
    type: GUESS,
    player,
    word: normalizeWord(word)
  };
}

export function skip(player) {
  return {
    type: SKIP,
    player,
  }
}

// root action creators
export function registerPlayer(name, team) {
  return {
    type: REGISTER_PLAYER,
    name,
    team,
  }
}

export function electSpymaster(name, team) {
  return {
    type: ELECT_SPYMASTER,
    name,
  }
}

export function startNewGame(player) {
  return {
    type: START_NEW_GAME,
    player,
  }
}

export function reset(player) {
  return {
    type: RESET,
    player
  }
}
