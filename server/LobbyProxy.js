import * as actions from '../actions';

export class LobbyDispatcher {
  constructor(lobbyId, baseDispatchFn) {
    this._baseDispatch = baseDispatchFn;
    this.lobbyId = lobbyId;

    // bind all those actions
    Object.keys(actions).forEach(name => {
      this._bindActionCreator(name, actions[name]);
    });
  }

  // unsure if needed
  _bindActionCreator(name, creator) {
    this[name] = function boundActionCreator(...args) {
      const action = creator(...args);
      return this.dispatch(action);
    }
  }

  dispatch(action) {
    const scopedAction = actions.lobbyScopedAction(this.lobbyId, action);
    return this._baseDispatch(scopedAction);
  }
}


// a client is an action creator that dispatches LOBBY_SCOPED_ACTIONs against a
// rootStore
export default class LocalLobbyProxy extends LobbyDispatcher {
  constructor(lobbyId, store) {
    super(lobbyId, store.dispatch);
    this.store = store;
  }

  getState() {
    return this.store.getState().lobbies[this.lobbyId];
  }

  subscribe(fn) {
    this.store.subscribe((newState) => {
      fn(this.getState());
    });
  }
}

export class RemoteLobbyProxy extends LocalLobbyProxy {
  constructor(lobbyId, localStore, io) {
    super(lobbyId, localStore);
    this._baseDispatch = (action) => {
      io.emit(ACTION_FROM_CLIENT, action);
    }
  }
}
