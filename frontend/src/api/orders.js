import { io } from 'socket.io-client';
import { request, SOCKET_URL } from './client';

// payload: { customerName, table, items: [{ dishId, quantity }] }
export const createOrder = (payload) => request('/orders', { method: 'POST', body: payload });
// returns the order plus { ahead, waitMinutes } calculated by the server
export const getOrder = (id) => request(`/orders/${id}`);
export const listOrders = () => request('/admin/orders');
export const setOrderStatus = (id, status) => request(`/admin/orders/${id}/status`, { method: 'PATCH', body: { status } });

// Calls cb whenever the server shouts 'order:updated'. Returns a function that stops listening.
export function subscribeToOrders(cb) {
  const socket = io(SOCKET_URL);
  socket.on('order:updated', cb);
  socket.on('connect', cb); // phones sleep: refetch after every reconnect
  return () => socket.disconnect();
}
