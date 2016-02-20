import LocalLobbyProxy from '../LobbyProxy';

export default class RemoteLobbyProxy extends LocalLobbyProxy {
  constructor(lobbyId, localStore, io) {
    super(lobbyId, localStore);
    this._baseDispatch = (action) => {
      io.emit(ACTION_FROM_CLIENT, action);
    }
  }
}
