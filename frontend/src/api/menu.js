import { request } from './client';

export const getMenu = () => request('/menu');
export const setDishAvailability = (id, available) => request(`/admin/menu/${id}`, { method: 'PATCH', body: { available } });
