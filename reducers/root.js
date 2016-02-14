import gameReducer, { initialState as gameInitialState } from './game';

const REGISTER_PLAYER = 'register player';
const ELECT_SPYMASTER = 'elect player as spymaster';
const START_NEW_GAME = 'start new game';

function registerPlayer(name, team) {
  return {
    type: REGISTER_PLAYER,
    name,
    team,
  }
}

function electSpymaster(name, team) {
  return {
    type: ELECT_SPYMASTER,
    name,
    team,
  }
}

function startNewGame(player) {
  return {
    type: START_NEW_GAME,
    player,
  }
}

function initialState() {
  return {
    players: [],
    game: null,
  }
}

function rootReducer(state = initialState(), action) {
}

function objToList(obj) {
  return Object.keys(obj).map(key => obj[key])
}
