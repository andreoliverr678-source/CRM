import axios from 'axios';

const BASE_URL = "https://agente-backend.amxxqr.easypanel.host/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Interceptor REQUEST: injeta Bearer token ──────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('barber_crm_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Interceptor RESPONSE: logout automático em 401 ───────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.error || error.message;
    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}: ${msg}`);

    // Token expirado ou inválido — limpa sessão e redireciona
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('barber_crm_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Rotas existentes ──────────────────────────────────────────────
export const fetchMetrics      = () => api.get('/metrics').then((r) => r.data);
export const fetchClients      = () => api.get('/clients').then((r) => r.data);
export const fetchClient       = (id) => api.get(`/clients/${id}`).then((r) => r.data);
export const fetchAppointments = () => api.get('/appointments').then((r) => r.data);
export const fetchMessages     = () => api.get('/messages').then((r) => r.data);

export const createClient      = (data) => api.post('/clients', data).then((r) => r.data);
export const updateClient      = (id, data) => api.put(`/clients/${id}`, data).then((r) => r.data);
export const deleteClient      = (id) => api.delete(`/clients/${id}`).then((r) => r.data);
export const createAppointment = (data) => api.post('/appointments', data).then((r) => r.data);
export const updateAppointment = (id, data) => api.put(`/appointments/${id}`, data).then((r) => r.data);
export const deleteAppointment = (id) => api.delete(`/appointments/${id}`).then((r) => r.data);
export const sendMessage       = (data) => api.post('/messages/webhook', data).then((r) => r.data);

// ── Auth ──────────────────────────────────────────────────────────
export const loginApi     = (email, password) => api.post('/auth/login', { email, password });
export const fetchMe      = ()                 => api.get('/auth/me');

// ── Profile ───────────────────────────────────────────────────────
export const fetchProfile   = ()     => api.get('/profile');
export const updateProfile  = (data) => api.put('/profile', data);
export const changePassword = (data) => api.put('/profile/password', data);

// ── Notifications ─────────────────────────────────────────────────
export const fetchNotifications     = ()    => api.get('/notifications');
export const markNotificationRead   = (id)  => api.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = ()  => api.put('/notifications/read-all');

export default api;