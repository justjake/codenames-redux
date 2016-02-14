// board layout
export const ROWS = 5;
export const COLS = 5;
export const SQUARES = ROWS * COLS;

// teams
export const RED = 'red';
export const BLUE = 'blue';
export const NEUTRAL = 'neutral';
export const KILL = 'kill';

// team counts
export const KILLS = 1;
export const STARTING_TEAMS = 9;
export const SECOND_TEAMS = 8;
export const NEUTRALS = SQUARES - STARTING_TEAMS - SECOND_TEAMS - KILLS;

// player roles - do we even need this?
export const GUESSER = 'guesser';
export const SPYMASTER = 'spymaster';

// turn phases
export const GIVE_CLUE = 'give clue';
export const GUESS = 'guess';

export const SKIP = 'skip';
