import SocketClient from 'socket.io-client';
import { LOBBY_UPDATE, JOIN_LOBBY, JOINED_LOBBY } from '../constants';
import { merge } from '../utils';
import { combineReducers, createStore } from 'redux';
import { lobbyUpdate } from '../server/actions';

const SOCKET_CONNECTED = 'socket connected';
const SOCKET_DISCONNECTED = 'socket disconnected';
const CREATED_PLAYER = 'created player';

function socketConnected() {
  return {
    type: SOCKET_CONNECTED,
  };
}

function socketDisconnected() {
  return {
    type: SOCKET_DISCONNECTED,
  };
}

function createdPlayer(lobbyId, player) {
  return {
    type: CREATED_PLAYER,
    lobbyId,
    player,
  };
}

function joinLobby(lobbyId) {
  return {
    type: JOIN_LOBBY,
    lobbyId,
  };
}

function socketReducer(state = SOCKET_DISCONNECTED, action) {
  switch (action.type) {
  case SOCKET_DISCONNECTED:
    return SOCKET_DISCONNECTED;
  case SOCKET_CONNECTED:
    return SOCKET_CONNECTED;
  }
  return state;
}

function lobbyMembershipReducer(state = {wanted: [], has: []}, action) {
  switch (action.type) {
  case SOCKET_DISCONNECTED:
    // is this the right way to do this? are room memberships retained on the
    // server across re-connects? If so, setting this to nothing is harmful.
    return merge(state, {has: []});
  case JOIN_LOBBY:
    return merge(state, {wanted: state.wanted.concat(action.lobbyId)});
  case JOINED_LOBBY:;
    return merge(state, {has: state.has.concat(action.lobbyId)});
  }
  return state;
}

function lobbyReducer(state = {}, action) {
  if (action.type === LOBBY_UPDATE) {
    return merge(state, {[action.lobbyId]: action.lobby});
  }
  return state;
}

function playerReducer(state = {}, action) {
  switch (action.type) {
  case CREATED_PLAYER:
    // we fire this event after a POST to join a lobby
    return merge(state, {[action.lobbyId]: action.player});

  case LOBBY_UPDATE:
    // keep up to date as the lobby updates - maybe someone else is now spymaster?
    if (!(action.lobbyId in state)) return state;
    const newPlayer = playerByName(action.lobby.players);
    return merge(state, {[action.lobbyId]: newPlayer});
  }
  return state;
}

const rootReducer = combineReducers({
  players: playerReducer,
  lobbies: lobbyReducer,
  memberships: lobbyMembershipReducer,
  socket: socketReducer,
  // TODO: react-router stuff
});

function connect(uri, store) {
  const socket = SocketClient(uri);
  socket.on('connect', () => {
    store.dispatch(socketConnected());
  });
  socket.on('disconnect', () => {
    store.dispatch(socketDisconnected());
  });
  socket.on(ACTION_FROM_SERVER, action => {
    store.dispatch(action);
  });

  return socket;
}

class Client {
  constructor(uri) {
    this.uri = uri;
    this.store = createStore(rootReducer);
    this.socket = connect(uri, this.store);
  }

  // this is pseudocode since I don't have a promise bepis yet
  createLobby() {
    return this.api.post(`lobby`).then(({lobbyId, lobby}) => {
      this.store.dispatch(lobbyUpdate(lobbyId, lobby));
      return lobbyId;
    });
  }

  // not sure how you pick team before seeing the people
  joinLobby(lobbyId, name, team) {
    return this.api.post(`lobby/${lobbyId}/join`, {name, team}).then(({player, lobby}) => {
      this.store.dispatch(createdPlayer(lobbyId, player));
      this.store.dispatch(lobbyUpdate(lobbyId, lobby));
      this.io.send(JOIN_LOBBY, lobbyId);
      this.store.dispatch(joinLobby(lobbyId));
      return player;
    });
  }
}
