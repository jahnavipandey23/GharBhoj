import { request } from './client';

// returns { token }
export const login = (credentials) => request('/auth/login', { method: 'POST', body: credentials });
