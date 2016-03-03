import { assert } from 'chai';
import Board from '../../models/Board';
import Player from '../../models/Player';
import Clue from '../../models/Clue';
import gameReducer, { initialState as gameInitialState } from '../../reducers/game';
import lobbyReducer, { initialState as lobbyInitialState } from '../../reducers/lobby';
import { giveClue, guess, registerPlayer, electSpymaster, startNewGame } from '../../actions';
import { GUESSER, SPYMASTER, GAME_OVER, KILL, RED, BLUE } from '../../constants';
import { playerByName } from '../../utils';
import setUpGame, {
  RED_SPYMASTER,
  BLUE_SPYMASTER,
  RED_GUESSER,
  BLUE_GUESSER,
} from '../../standalone-game';
import { createStore } from 'redux';

function makeGameState(started = true) {
  const store = createStore(lobbyReducer);
  const dispatcher = {
    registerPlayer: (name, team) => store.dispatch(registerPlayer(name, team)),
    electSpymaster: (name) => store.dispatch(electSpymaster(name)),
    startNewGame: () => store.dispatch(startNewGame()),
  };
  setUpGame(dispatcher, started);
  return store.getState();
}

describe('reducers/lobby', () => {
  describe('on game end', () => {
    let state;
    let finalWord;
    let guesser
    let spymaster;
    const makeGuess = () => guess(guesser, finalWord);
    const makeClue = (count) => giveClue(spymaster, new Clue('bepis', count));

    beforeEach(() => {
      state = makeGameState();
      const board = state.game.board;
      const team = state.game.team;
      guesser = playerByName(state.players, team === RED ? RED_GUESSER : BLUE_GUESSER);
      spymaster = playerByName(state.players, team === RED ? RED_SPYMASTER : BLUE_SPYMASTER);
      let words;
      [finalWord, ...words] = board.wordsOf(team);
      words.forEach(w => board.pick(w));
      state = lobbyReducer(state, makeClue(2));
    });

    it('makes all players guessers', () => {
      const newState = lobbyReducer(state, makeGuess());
      assert.isAbove(newState.players.length, 0, 'we still have players');
      newState.players.forEach(p => assert.strictEqual(p.role, GUESSER, 'player is guesser'));
    })
  })
})
