import api from './axios';

export const fetchPasswords  = ()         => api.get('/passwords');
export const createPassword  = (data)     => api.post('/passwords', data);
export const updatePassword  = (id, data) => api.put(`/passwords/${id}`, data);
export const deletePassword  = (id)       => api.delete(`/passwords/${id}`);
