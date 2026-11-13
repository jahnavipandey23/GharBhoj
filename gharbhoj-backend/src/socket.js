// Socket.io = an always-open connection between browser and server, so the server can PUSH news.
// Whenever an order changes we shout "order:updated". Every open screen hears it and refetches.
import { Server } from 'socket.io';

let io;
let timer = null;

export function initSocket(httpServer) {
  io = new Server(httpServer, { cors: { origin: process.env.CLIENT_URL } });
}

// Several changes within 100ms (an order moving plus a batch of auto-cancels) become ONE event,
// so screens refetch once instead of many times.
export const notifyOrdersChanged = () => {
  if (timer) return;
  timer = setTimeout(() => { timer = null; io?.emit('order:updated'); }, 100);
};