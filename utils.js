// on a plane with no internet, so no utils from the interbutts

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
export function pad(str, needed) {
  if (str.length === needed) return str;
  return (str + repeat(' ', needed - str.length).join(''));
}
