import alt from '../alt';
import { createStore } from 'redux';

export function merge(state, updatedProp) {
  return Object.assign({}, state, updatedProp);
}

function guardUndefined(state, offendingReducerName) {
  if (state === undefined) {
    throw new TypeError(`reducer ${offendingReducerName} returned undefined`);
  }
  return state;
}

/**
 * Scope a reducer to a specific property of a larger state object. This allows
 * your to not have to weed through intermediate properties in a big global
 * state object, similar to `composeReducers`.
 *
 * The global state is still provided to your store as the 3rd argument in case
 * you need to reference other information in the store, eg for checking an
 * association before storing.
 *
 * @param reducer {function(scopedState :: Object, action :: FluxAction, globalState)}
 * @param stateProperty {String, Symbol}
 */
export function scopeReducer(reducer, stateProperty) {
  const scopedReducer = function scoped(state, action, totalState) {
    const scopedState = state[stateProperty];
    const newScopedState = reducer(scopedState, action, totalState || state);
    // no change was made
    if (scopedState === newScopedState) return state;
    // merge in changed scoped state
    return merge(state, {[stateProperty]: newScopedState});
  };
  scopedReducer.name = 'scoped_' + reducer.name || 'reducer';
  return scopedReducer;
}

/**
 * special jake-based implementation of combineReducers from Redux.
 * Major feature is that this combineReducers always passes the root state as
 * the 3rd argument to each reducer,
 * so the signature of a reducer here is
 *   function(scopedState :: Any, action :: FluxAction, totalState :: Any)
 * instead of just
 *   function(scopedState :: Any, action :: FluxAction)
 * Why? Because some parts of the app may have data dependencies. For instance,
 * in this Targets app, many updates depend on whether an incoming model
 * matches the current app.
 *
 * @see http://rackt.org/redux/docs/api/combineReducers.html
 */
export function combineReducers(reducerObj) {
  const reducers = Object.keys(reducerObj)
    .map(property => scopeReducer(reducerObj[property], property));
  return reduceReducers(...reducers);
}

/**
 * combine with reduceReducers to compose scoped and handling reducers assumes
 * that your reducer does not need to further inspect the action, so only
 * `action.payload` is passed to your inner function.
 */
export function handleAction(actionType, reducer) {
  const handlingReducer = function handler(state, action, ...args) {
    if (action.type === actionType) return reducer(state, action.payload, ...args);
    return state;
  };
  handlingReducer.name = 'handler_' + reducer.name || 'Reducer';
  return handlingReducer;
}

/**
 * combine multiple reducers, passing the generated state and actions through
 * each of them.
 */
export function reduceReducers(...reducers) {
  const reducedReducers = function reduced(state, ...args) {
    return reducers.reduce(
      (newState, nextReducer) => guardUndefined(nextReducer(newState, ...args), nextReducer.name),
      state
    );
  };
  reducedReducers.name = `reduced[${reducers.map(r => r.name).join(',')}]`;
  return reducedReducers;
}

/**
 * Integrate with the Redux chrome developer tools.
 * @see https://github.com/zalmoxisus/redux-devtools-extension
 * @See https://github.com/gaearon/redux-devtools
 */
function devTools() {
  if (typeof window !== 'undefined' && window && window.devToolsExtension) {
    return window.devToolsExtension();
  }

  // if there are no devtools, its fine to return undefined.
  return undefined;
}

// alt interop
// creates a store that recieves all alt actions
export function createAltStore(reducer, state) {
  const store = createStore(reducer, state, devTools());
  store.dispatchToken = alt.dispatcher.register(action => store.dispatch(action));
  return store;
}
