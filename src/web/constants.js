// actions - emitting these events dispatches the payload action on the server/client
export const ACTION_FROM_SERVER = 'socket event: server emitted action';
export const ACTION_FROM_CLIENT = 'socket event: client emitted action';

// emitted by the client, asks the server to send it live updates for a lobby
export const JOIN_LOBBY = 'socket command: join lobby';

// emitted by the server once the client is in that lobby;
export const JOINED_LOBBY = 'server action: joined lobby';

// emitted by the server when a lobby changes state in the global store
export const LOBBY_UPDATE = 'server action: lobby state changed';

export const API_V0 = '/api/v0';
