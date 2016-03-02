// on a plane with no internet, so no utils from the interbutts

import { RED, BLUE, SPYMASTER, GUESSER } from './constants';

// a coin flip
export function fiddyFiddy() {
  return Math.random() > 0.5;
}
export function repeat(thing, times) {
  const arr = [];
  for (let i=0; i<times; i++) {
    arr.push(thing)
  }
  return arr;
}

// PLS SAVE ME FROM MYSELF
// runtime o(Math.random()) fuuu
// TODO: replace with lodash or whatever
export function shuffled(array) {
  const result = [];
  const seen = {};

  while (result.length < array.length) {
    const idx = Math.floor(Math.random() * array.length);
    // fug
    if (seen[idx]) continue;

    result.push(array[idx]);
    seen[idx] = true;
  }

  return result;
}

// pad a string to a required length using spaces
export function pad(str, needed, char = ' ') {
  if (str.length === needed) return str;
  return (str + repeat(char, needed - str.length).join(''));
}

export function merge(base, added) {
  return Object.assign({}, base, added);
}

export function update(object, prop, newValue) {
  if (object[prop] === newValue) return object;
  return merge(object, {[prop]: newValue});
}

export function map2d(grid, transformFn) {
  const result = [];
  for (let r = 0; r < grid.length; r++) {
    result[r] = [];
    for (let c = 0; c < grid[r].length; c++) {
      result[r][c] = transformFn(grid[r][c], r, c);
    }
  }
  return result;
}

// returns longest string or array in a list
export function longest(list) {
  return list.slice()
    .sort((a, b) => b.length - a.length)[0];
}

export function nextTeam(team) {
  if (team === RED) return BLUE;
  if (team === BLUE) return RED;
  throw new Error(`wat: should not have unknown team ${team}`);
}


export function spymastersOf(list) {
  return list.filter(player => player.role === SPYMASTER);
}

export function guessersOf(list) {
  return list.filter(player => player.role === GUESSER);
}

export function ofTeam(list, team) {
  return list.filter(player => player.team === team);
}

export function playerByName(list, name) {
  return list.filter(player => player.name === name)[0];
}

export function latestClue(clueHistory) {
  const last = clueHistory[clueHistory.length - 1];
  if (!last) return null;
  return last.clue;
}
