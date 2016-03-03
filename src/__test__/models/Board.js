import { assert } from 'chai';
import Board from '../../models/Board';
import { RED, KILL, BLUE, NEUTRAL, TEAMS } from '../../constants';

describe('models/Board', () => {

  let b;
  beforeEach(() => {
    b = new Board();
  })

  describe('Board#getDepleted', () => {
    describe('when none depleted', () => {
      it('returns null', () => {
        assert.strictEqual(b.getDepleted(), null);
      })
    });

    [RED, KILL, BLUE].forEach(team => {
      describe(`when all ${team} words picked`, () => {
        it(`returns the team "${team}"`, () => {
          const teamWords = b.wordsOf(team);
          teamWords.forEach(w => b.pick(w));

          assert.strictEqual(b.getDepleted(), team);
        });
      })
    });

    describe('when NEUTRAL depleted', () => {
      it('returns null', () => {
          const teamWords = b.wordsOf(NEUTRAL);
          teamWords.forEach(w => b.pick(w));

          assert.strictEqual(b.getDepleted(), null);
      });
    })
  })
})
