import { omit } from 'lodash';
import lobbiesReducer, { initialState as lobbiesInitialState } from '../reducers/root2';
import * as actions from '../actions';
import { merge, update } from '../utils';
import {
  CREATE_LOBBY_IN_CHANNEL,
  JOIN_LOBBY_TO_CHANNEL,
  REMOVE_LOBBY_FROM_CHANNEL
} from './constants';

export function initialState() {
  return {
    channelToLobbyId: {},
    lobbyStore: lobbiesInitialState(),
  };
}

export function lobbyForChannel(state, channel) {
  const lobbyId = state.channelToLobbyId[channel];
  if (lobbyId) return state.lobbyStore.lobbies[lobbyId];
  return undefined;
}

export default function botReducer(state = initialState(), action) {
  switch (action.type) {
    case CREATE_LOBBY_IN_CHANNEL:
      // don't create lobby if we already have one
      if (lobbyForChannel(state, action.channel)) return state;

      const ticket = `inline create lobby action`;
      const createLobbyAction = actions.createLobby(ticket);
      const newLobbyStore = lobbyReducer(state.lobbyStore, createLobbyAction);
      const newLobbyId = newLobbyStore.ticketsToIds[ticket];
      const newChannelMapping = channelToLobbyIdReducer(state.channelToLobbyId, joinLobbyToChannel(action.channel, newLobbyId));
      return { lobbyStore: newLobbyStore, channelToLobbyId: newChannelMapping };

    case JOIN_LOBBY_TO_CHANNEL:
      return update(
        state, 'channelToLobbyId',
        channelToLobbyIdReducer(state.channelToLobbyId, action));

    case REMOVE_LOBBY_FROM_CHANNEL:
      return update(
        state, 'channelToLobbyId',
        channelToLobbyIdReducer(state.channelToLobbyId, action));

    default:
      return update(
        state, 'lobbyStore',
        lobbyReducer(state.lobbyStore, action));
  }
}

function channelToLobbyIdReducer(state = {}, action) {
  switch (action.type) {
    case JOIN_LOBBY_TO_CHANNEL:
      return merge(state, {[action.channel]: action.lobbyId});
    case REMOVE_LOBBY_FROM_CHANNEL:
      return omit(state, action.channel);
    default:
      return state;
  }
}
