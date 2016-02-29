# codenames-redux

ok, a redux learning project that implements the great boardgame Codenames. Very
fun IRL, let's see how far we can go with redux.

So far, there is a barebones, terminal-centric UI for entering commands, and a
simple HTTP server for viewing Spymaster and Guesser versions of the current
game.

## Usage

run `npm test` to start the game. Type commands like `give clue foo 2` to give
`foo 2` as a clue. Visit localhost:1337 for the guesser view. I recommend
putting this on a second computer and letting the guessers stare at it.

The main computer should be used for the spymasters. Put a `watch curl
localhost:1337/spymaster` in one terminal, and leave the game process with the
readline interface in another terminal. Have the guessers relay their guesses to
the spymasters, who do all the computer input.

Here's how it looks:

Playing in "single-game mode" in the terminal:
![playing the game](http://take.ms/8iNjn)

The start of the web ui:
![wow material ui quite nice](http://take.ms/xr2VE)

## Hubot plugin

Highly experimental.

Install this from `npm`, then add a script to your hubot/scripts like this:

```
// codenames.js
var plugin = require('codenames-redux/bot');

module.exports = function (robot) {
  plugin(robot);
}
```
