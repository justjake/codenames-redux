import * as actions from './actions';

export default class LobbyDispatcher {
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
