import { io } from 'socket.io-client';
import { request, SOCKET_URL } from './client';

// payload: { customerName, table, items: [{ dishId, quantity }] }
export const createOrder = (payload) => request('/orders', { method: 'POST', body: payload });
// returns the order plus { ahead, waitMinutes } calculated by the server
export const getOrder = (id) => request(`/orders/${id}`);
export const listOrders = () => request('/admin/orders');
export const setOrderStatus = (id, status) => request(`/admin/orders/${id}/status`, { method: 'PATCH', body: { status } });

// ONE socket for the whole app. Pages subscribe/unsubscribe without opening new connections.
let socket;
const subscribers = new Set();

function getSocket() {
  if (socket) return socket;
  socket = io(SOCKET_URL);
  socket.on('order:updated', () => subscribers.forEach((cb) => cb()));
  let first = true;
  socket.on('connect', () => {
    if (first) { first = false; return; } // skip the first connect; pages already load on open
    subscribers.forEach((cb) => cb());    // phones sleep: refetch after every RE-connect
  });
  return socket;
}

// Calls cb whenever the server shouts 'order:updated'. Returns a function that stops listening.
export function subscribeToOrders(cb) {
  getSocket();
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}