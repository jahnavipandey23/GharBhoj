import { request } from './client';

export const getSlots = (date, guests) => request(`/slots?date=${date}&guests=${guests}`);
// payload: { name, phone, guests, date, time }
export const createBooking = (payload) => request('/bookings', { method: 'POST', body: payload });
export const listBookings = () => request('/admin/bookings');

export const verifyBooking = (ref, method) => request(`/admin/bookings/${encodeURIComponent(ref)}/verify`, { method: 'PATCH', body: { method } });
export const rejectBooking = (ref) => request(`/admin/bookings/${encodeURIComponent(ref)}/reject`, { method: 'PATCH' });
export const getBookingStatus = (ref, phone) => request(`/bookings/${encodeURIComponent(ref)}/status?phone=${encodeURIComponent(phone)}`);
