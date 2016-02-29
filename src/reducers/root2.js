import lobbyReducer, { initialState as lobbyInitialState } from './lobby';
import { includes, sampleSize, omit } from 'lodash';
import { CREATE_LOBBY, DESTROY_LOBBY, LOBBY_SCOPED_ACTION } from '../constants';
import { UnknownActionError, UnknownLobbyIdError } from '../errors';
import { merge } from '../utils';

// lobby ids are like Jackbox room codes - short 4-letter ids
function makeLobbyId(existingLobbyIds) {
  const ID_LENGTH = 4
  const ID_SPACE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  const id = sampleSize(ID_SPACE, ID_LENGTH);
  if (includes(existingLobbyIds, id)) return makeLobbyId(existingLobbyIds);
  return id.join('');
}

export function initialState() {
  return {
    lobbies: {},
    ticketsToIds: {},
  };
}

function guardLobbyId(state, action) {
  if (!(action.lobbyId in state.lobbies)) {
    throw new UnknownLobbyIdError(action.lobbyId);
  }
}

export default function rootReducer(state = initialState(), action) {
  switch (action.type) {
  case CREATE_LOBBY:
    const allIds = Object.keys(state.lobbies);
    const id = makeLobbyId(allIds);
    const newLobby = lobbyInitialState();
    const lobbies = merge(state.lobbies, {[id]: newLobby});
    const ticketsToIds = merge(state.ticketsToIds, {[action.ticket]: id});
    return merge(state, {lobbies, ticketsToIds});

  case DESTROY_LOBBY:
    guardLobbyId(state, action);
    const lobbies3 = omit(state.lobbies, action.lobbyId);
    return merge(state, {lobbies: lobbies3});

  case LOBBY_SCOPED_ACTION:
    guardLobbyId(state, action);
    const oldLobby = state.lobbies[action.lobbyId];
    const newLobby2 = lobbyReducer(oldLobby, action.action);
    if (newLobby2 === oldLobby) return state;
    const lobbies2 = merge(state.lobbies, {[action.lobbyId]: newLobby2});
    return merge(state, {lobbies: lobbies2});

  default:
    return state;
  }
}
