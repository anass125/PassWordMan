import api from './axios';

export const fetchAllUsers = () => api.get('/admin/users');
