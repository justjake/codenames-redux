"use strict";
import ExtendableError from 'es6-error';

export class UnknownWordError extends ExtendableError {};
export class UnknownLobbyIdError extends ExtendableError {};
export class UnknownActionError extends ExtendableError {
  constructor(action) {
    super(`action "${action.type}": ${JSON.stringify(action)}`);
  }
}
