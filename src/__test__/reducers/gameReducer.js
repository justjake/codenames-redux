import { assert } from 'chai';
import Board from '../../models/Board';
import Player from '../../models/Player';
import Clue from '../../models/Clue';
import gameReducer, { initialState } from '../../reducers/game';
import { giveClue, guess } from '../../actions';
import { GUESSER, SPYMASTER, GAME_OVER, KILL } from '../../constants';
import { nextTeam } from '../../utils';

function afterGiveClue(state, word, count) {
  const clue = new Clue(word, count);
  const spymaster = new Player(state.team, SPYMASTER, 'a spymaster');
  return gameReducer(state, giveClue(spymaster, clue));
}

function afterGuess(state, word) {
  const player = new Player(state.team, GUESSER, 'a guesser');
  return gameReducer(state, guess(player, word));
}

describe('reducers/game', () => {
  let state;
  beforeEach(() => {
    const b = new Board();
    state = initialState(b);
  });

  it(`state doesn't change when re-guessing a word`, () => {
    state = afterGiveClue(state, 'bepis', 5);
    const word = state.board.wordsOf(state.team)[0];
    const afterFirstGuess = afterGuess(state, word);
    const afterSecondGuess = afterGuess(afterFirstGuess, word);

    assert.strictEqual(afterFirstGuess, afterSecondGuess, 'no state changed');
  });

  it(`gives lots of guesses when giving a clue with 0`, () => {
    const afterGuess = afterGiveClue(state, 'bepis', 0);
    assert.isAbove(afterGuess.remainingGuesses, 5 * 5, 'enough guesses');
  });

  describe('when ending game', () => {
    let team;
    let finalWord;
    let guesser;
    let spymaster;

    const makeClue = (count) => giveClue(spymaster, new Clue('bepis', count));
    const makeGuess = () => guess(guesser, finalWord);
    const makeKillGuess = () => guess(guesser, state.board.wordsOf(KILL)[0]);

    beforeEach(() => {
      team = state.team;
      guesser = new Player(team, GUESSER, 'the guesser');
      spymaster = new Player(team, SPYMASTER, 'the spymaster');
      const b = state.board;
      let words;
      [finalWord, ...words] = b.wordsOf(team);
      words.forEach(w => b.pick(w));
    });

    function includeExamples() {
      describe('guess is correct', () => {
        it('sets the game phase to GAME_OVER', () => {
          const newState = gameReducer(state, makeGuess());
          assert.strictEqual(newState.phase, GAME_OVER);
        });

        it('the winner is the guessing team', () => {
          const newState = gameReducer(state, makeGuess());
          assert.strictEqual(newState.winner, state.team);
          assert.strictEqual(newState.winner, team);
        })
      });

      describe('guess is kill', () => {
        it('sets the game phase to GAME_OVER', () => {
          const newState = gameReducer(state, makeKillGuess());
          assert.strictEqual(newState.phase, GAME_OVER);
        });

        it('the winner is the other team', () => {
          const newState = gameReducer(state, makeKillGuess());
          assert.strictEqual(newState.winner, nextTeam(state.team));
        })
      })
    }

    describe('when many clues remaining', () => {
      beforeEach(() => {
        state = gameReducer(state, makeClue(999))
      });

      includeExamples();
    });

    describe('when only one clue remaining', () => {
      beforeEach(() => {
        state = gameReducer(state, makeClue(0));
      });

      includeExamples();
    });
  })
})
