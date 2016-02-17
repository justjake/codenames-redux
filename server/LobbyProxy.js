import * as actions from '../actions';

// a client is an action creator that dispatches LOBBY_SCOPED_ACTIONs against a
// rootStore
export default class LobbyProxy {
  constructor(lobbyId, store) {
    this.store = store;
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

  getState() {
    return this.store.getState().lobbies[this.lobbyId];
  }

  subscribe(fn) {
    this.store.subscribe((newState) => {
      fn(this.getState());
    });
  }

  dispatch(action) {
    const scopedAction = actions.lobbyScopedAction(this.lobbyId, action);
    return this.store.dispatch(scopedAction);
  }
}
