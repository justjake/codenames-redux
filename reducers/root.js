import gameReducer, { initialState as gameInitialState } from './game';

const REGISTER_PLAYER = 'register player';
const ELECT_SPYMASTER = 'elect player as spymaster';

registerPlayer(name, team) {
  return {
    type: REGISTER_PLAYER,
    name,
    team,
  }
}

electSpymaster(name, team) {
  return {
    type: ELECT_SPYMASTER,
    name,
    team,
  }
}
