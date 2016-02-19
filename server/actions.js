import { LOBBY_UPDATE, JOINED_LOBBY } from '../constants';

export function lobbyUpdate(lobbyId, lobby) {
  return {
    type: LOBBY_UPDATE,
    lobbyId,
    lobby,
  };
}

export function joinedLobby(lobbyId) {
  return {
    type: JOINED_LOBBY,
    lobbyId,
  };
}
