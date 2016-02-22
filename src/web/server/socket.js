import socketIO from 'socket.io';
import { JOIN_LOBBY, ACTION_FROM_CLIENT, ACTION_FROM_SERVER } from '../constants';
import { joinedLobby, lobbyUpdate } from '../actions';

export default function makeSocketApp(httpServer, store) {
  const io = socketIO(httpServer);

  // allow sockets to join lobbies with the JOIN_LOBBY command
  io.on('connection', socket => {
    console.log(`new client socket ${socket.id}`);

    socket.on(JOIN_LOBBY, (lobbyId) => {
      socket.join(lobbyId);
      socket.send(ACTION_FROM_SERVER, joinedLobby(lobbyId));
      console.log(`socket ${socket.id} joined lobby ${lobbyId}`);
    });

    socket.on(ACTION_FROM_CLIENT, (action) => {
      store.dispatch(action);
    });

    socket.on('error', (err) => {
      console.error(err);
      console.error(`err handling socket ${socket.id}`)
    });
  });

  let prevState = store.getState();

  // whenever there is a change, broadcast new state to each game by id
  store.subscribe(() => {
    const state = store.getState();
    Object.keys(state.lobbies).forEach(lobbyId => {
      const oldLobby = prevState.lobbies[lobbyId];
      const newLobby = state.lobbies[lobbyId];
      if (oldLobby === newLobby) return;
      io.to(lobbyId).emit(ACTION_FROM_SERVER, lobbyUpdate(lobbyId, newLobby));
    });
    prevState = state;
  });

  return io;
}
