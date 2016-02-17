import lobbyReducer, { initialState as lobbyInitialState } from './lobby';
import { contains, sampleSize } from 'lodash';
import { CREATE_LOBBY, DESTROY_LOBBY, LOBBY_SCOPED_ACTION } from '../constants';
import { UnknownActionError } from '../errors'

// lobby ids are like Jackbox room codes - short 4-letter ids
function makeLobbyId(existingLobbyIds) {
  const ID_LENGTH = 4
  const ID_SPACE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  const id = sampleSize(ID_SPACE, ID_LENGTH);
  if (contains(existingLobbyIds, id)) return makeLobbyId(existingLobbyIds);
  return id;
}

export function initialState() {
  return {
    lobbies: {}
  }
}

const KNOWN_ACTIONS = [CREATE_LOBBY, DESTROY_LOBBY, LOBBY_SCOPED_ACTION]

export function rootReducer(state = initialState(), action) {
  if (!contains(action.type, KNOWN_ACTIONS)) throw new UnknownActionError(action);
  switch (action) {

  }
}
