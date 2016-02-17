import {
  GIVE_CLUE,
  GUESS,
  SKIP,

  REGISTER_PLAYER,
  ELECT_SPYMASTER,
  START_NEW_GAME,
  RESET,

  CREATE_LOBBY,
  DESTROY_LOBBY,
  LOBBY_SCOPED_ACTION
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

function normalizeWord(word) {
  return word.trim().toUpperCase();
}

export function createLobby(ticket) {
  return {
    type: CREATE_LOBBY,
    // the lobby will be created with a ticket so the caller knows which lobby
    // is theirs. May be hidden as an implementation detail.
    ticket,
  };
}

export function destroyLobby(lobbyId) {
  return {
    type: DESTROY_LOBBY,
    lobbyId,
  };
}

export function lobbyScopedAction(lobbyId, action) {
  return {
    type: LOBBY_SCOPED_ACTION,
    action,
  };
}
