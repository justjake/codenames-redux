import { assert } from 'chai';
import * as views from '../../bot/views';
import Board from '../../models/Board';

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

  describe('codeblock', () => {
    it('wraps text in a codeblock', () => {
      assert.equal(views.codeblock('foo\nbar'), '```\nfoo\nbar\n```\n');
    })
  });

  describe('renderBoard', () => {
    it('returns a string', () => {
      const b = new Board();
      assert.isString(views.renderBoard(b));
    })
  })
})
