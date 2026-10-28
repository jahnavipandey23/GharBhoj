import { request } from './client';

export const getSlots = (date, guests) => request(`/slots?date=${date}&guests=${guests}`);
// payload: { name, phone, guests, date, time }
export const createBooking = (payload) => request('/bookings', { method: 'POST', body: payload });
export const listBookings = () => request('/admin/bookings');
