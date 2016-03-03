import { assert } from 'chai';
import * as views from '../../bot/views';

describe('bot/views', () => {
  describe('mention', () => {
    it('returns the username unmangled', () => {
      assert.equal(views.mention('@jake'), '@jake')
    })
  });

  describe('dontMention', () => {
    it('returns the username with a dot after the first letter', () => {
      assert.equal(views.dontMention('@jake'), '@j.ake');
    })
  });
})
