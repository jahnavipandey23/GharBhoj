import { request } from './client';

// { capacity, perOrder, totalTables }
export const getSettings = () => request('/admin/settings');
export const saveSettings = (s) => request('/admin/settings', { method: 'PUT', body: s });
