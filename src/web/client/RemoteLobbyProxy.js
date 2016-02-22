import LocalLobbyProxy from '../../LobbyProxy';
import { ACTION_FROM_CLIENT } from '../constants';

export default class RemoteLobbyProxy extends LocalLobbyProxy {
  constructor(lobbyId, localStore, io) {
    super(lobbyId, localStore);
    this._baseDispatch = (action) => {
      io.emit(ACTION_FROM_CLIENT, action);
    }
  }
}
