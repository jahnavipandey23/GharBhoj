// The ONE place that knows how to talk to the backend. Every other api/*.js file uses `request`.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL;

// The database stores image paths like "/images/pbm.jpg". This makes them full links.
export const assetUrl = (path) => (!path ? null : path.startsWith('http') ? path : `${API_URL}${path}`);

export async function request(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('gb_token'); // set after admin login
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}
