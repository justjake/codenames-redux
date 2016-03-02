import Board from '../models/Board';
import persist from 'node-persist'
import path from 'path';

// mutate json data to replace board JSON with Board instances
function hydrateBoards(json) {
  if (!json) return;
  const lobbyIds = Object.keys(json.lobbyStore.lobbies);
  lobbyIds.forEach(lobbyId => {
    console.log(`hydrating lobbyId ${lobbyId}`)
    const lobby = json.lobbyStore.lobbies[lobbyId];
    if (lobby.game) lobby.game.board = Board.fromData(lobby.game.board);
  });
  return json;
}

const KEY = 'store_as_json.json';

export default class AtomStore {
  constructor(directory) {
    const absPath = path.isAbsolute(directory) ?
                    directory :
                    path.join(process.cwd(), directory);
    console.log(`connecting to store in ${absPath}`)
    this.storage = persist.create({
      dir: absPath,
    });
    this.storage.initSync();
  }

  put(json) {
    return this.storage.setItem(KEY, json);
  }

  get() {
    return hydrateBoards(this.storage.getItem(KEY));
  }
}
