// Socket.io = a always-open connection between browser and server, so the server can PUSH news.
// Whenever an order changes we shout "order:updated". Every open screen hears it and refetches.
import { Server } from 'socket.io';

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, { cors: { origin: process.env.CLIENT_URL } });
}

export const notifyOrdersChanged = () => io?.emit('order:updated');
