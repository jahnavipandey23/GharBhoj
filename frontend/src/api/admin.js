import { request } from './client';

export const getCustomers = () => request('/admin/customers');
export const getOrdersByHour = () => request('/admin/analytics/orders-by-hour');
