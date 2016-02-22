import { SOCKET_CONNECTED, SOCKET_DISCONNECTED, CREATED_PLAYER } from './constants.js';
import { JOIN_LOBBY } from '../constants';

export function socketConnected() {
  return {
    type: SOCKET_CONNECTED,
  };
}

export function socketDisconnected() {
  return {
    type: SOCKET_DISCONNECTED,
  };
}

export function createdPlayer(lobbyId, player) {
  return {
    type: CREATED_PLAYER,
    lobbyId,
    player,
  };
}

// emitted when we request the server to join a lobby
export function joinLobby(lobbyId) {
  return {
    type: JOIN_LOBBY,
    lobbyId,
  };
}
