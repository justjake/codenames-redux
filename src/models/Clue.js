import { BadClueCountError } from '../errors';

export default class Clue {
  constructor(word, count) {
    this.word = word;
    this.count = count;

    if (!Number.isInteger(count) || count < 0) {
      throw new BadClueCountError(`clue count ${count} is not a positive integer`);
    }
  }
}
