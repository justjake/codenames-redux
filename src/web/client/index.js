import SocketClient from 'socket.io/node_modules/socket.io-client';
import { LOBBY_UPDATE, JOIN_LOBBY, JOINED_LOBBY,
         ACTION_FROM_SERVER, ACTION_FROM_CLIENT } from '../constants';
import { combineReducers, createStore } from 'redux';
import { lobbyUpdate } from '../actions';
import { createdPlayer, joinLobby } from './actions';
import RemoteLobbyProxy from './RemoteLobbyProxy';
import { socketDisconnected, socketConnected } from './actions';
import rootReducer from './reducers';
import Api from './Api';
import { merge, playerByName } from '../../utils';

function connect(uri, store) {
  const socket = SocketClient(uri);

  socket.on('connect', () => {
    store.dispatch(socketConnected());
  });
  socket.on('disconnect', () => {
    store.dispatch(socketDisconnected());
  });
  socket.on(ACTION_FROM_SERVER, action => {
    console.log('server action', action);
    store.dispatch(action);
  });

  return socket;
}

export default class Client {
  constructor(socketServerRoot, apiRoot) {
    this.api = new Api(apiRoot);
    this.store = createStore(rootReducer);
    this.socket = connect(socketServerRoot, this.store);
    this._lobbyProxies = {};
  }

  // this is pseudocode since I don't have a promise bepis yet
  createLobby() {
    return this.api.post(`lobby`, {ticket: 'bark'}).then(({lobbyId, lobby}) => {
      this.store.dispatch(lobbyUpdate(lobbyId, lobby));
      return lobbyId;
    });
  }

  // not sure how you pick team before seeing the people
  joinLobby(lobbyId, name, team) {
    return this.api.post(`lobby/${lobbyId}/join`, {name, team}).then(({player, lobby}) => {
      this.store.dispatch(createdPlayer(lobbyId, player));
      this.store.dispatch(lobbyUpdate(lobbyId, lobby));
      this.socket.emit(JOIN_LOBBY, lobbyId);
      this.store.dispatch(joinLobby(lobbyId));
      return player;
    });
  }

  // usage: client.lobby('LGTM').elect
  lobby(lobbyId) {
    const proxy = this._lobbyProxies[lobbyId] || new RemoteLobbyProxy(lobbyId, this.store, this.socket);
    this._lobbyProxies[lobbyId] = proxy;
    return proxy;
  }

  getPlayer(lobbyId) {
    return this.store.getState().players[lobbyId];
  }

  all() {
    return this.api.get('all');
  }
}
