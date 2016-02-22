import {
  SOCKET_DISCONNECTED,
  SOCKET_CONNECTED
} from './constants';

import {
  JOIN_LOBBY,
  JOINED_LOBBY,
  CREATED_PLAYER,
  LOBBY_UPDATE,
} from '../constants';

import { combineReducers } from 'redux';
import { merge, playerByName } from '../../utils';

export function socketReducer(state = SOCKET_DISCONNECTED, action) {
  switch (action.type) {
  case SOCKET_DISCONNECTED:
    return SOCKET_DISCONNECTED;
  case SOCKET_CONNECTED:
    return SOCKET_CONNECTED;
  }
  return state;
}

export function lobbyMembershipReducer(state = {wanted: [], has: []}, action) {
  switch (action.type) {
  case SOCKET_DISCONNECTED:
    // is this the right way to do this? are room memberships retained on the
    // server across re-connects? If so, setting this to nothing is harmful.
    return merge(state, {has: []});
  case JOIN_LOBBY:
    return merge(state, {wanted: state.wanted.concat(action.lobbyId)});
  case JOINED_LOBBY:
    return merge(state, {has: state.has.concat(action.lobbyId)});
  }
  return state;
}

export function lobbyReducer(state = {}, action) {
  if (action.type === LOBBY_UPDATE) {
    return merge(state, {[action.lobbyId]: action.lobby});
  }
  return state;
}

export function playerReducer(state = {}, action) {
  switch (action.type) {
  case CREATED_PLAYER:
    // we fire this event after a POST to join a lobby
    return merge(state, {[action.lobbyId]: action.player});

  case LOBBY_UPDATE:
    // keep up to date as the lobby updates - maybe someone else is now spymaster?
    if (!(action.lobbyId in state)) return state;
    const newPlayer = playerByName(action.lobby.players, state[action.lobbyId].name);
    return merge(state, {[action.lobbyId]: newPlayer});
  }
  return state;
}

export const rootReducer = combineReducers({
  players: playerReducer,
  lobbies: lobbyReducer,
  memberships: lobbyMembershipReducer,
  socket: socketReducer,
  // TODO: react-router stuff
});

export default rootReducer;
