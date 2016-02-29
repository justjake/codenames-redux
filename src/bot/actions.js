import {
  CREATE_LOBBY_IN_CHANNEL,
  JOIN_LOBBY_TO_CHANNEL,
  REMOVE_LOBBY_FROM_CHANNEL
} from './constants';

export function createLobbyInChannel(channel, lobbyId) {
  return {
    type: CREATE_LOBBY_IN_CHANNEL,
    channel,
  };
}

export function joinLobbyToChannel(channel, lobbyId) {
  return {
    type: JOIN_LOBBY_TO_CHANNEL,
    channel,
    lobbyId,
  };
}

export function removeLobbyFromChannel(channel) {
  return {
    type: REMOVE_LOBBY_FROM_CHANNEL,
    channel,
  };
}
