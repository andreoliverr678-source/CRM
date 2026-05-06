import axios from 'axios';

// 🔥 URL fixa para garantir funcionamento em produção
const BASE_URL = "https://agente-backend.amxxqr.easypanel.host/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Log de erros centralizado
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.error || error.message;
    console.error(`[API Error] ${error.config?.baseURL}${error.config?.url}: ${msg}`);
    return Promise.reject(error);
  }
);

// Rotas
export const fetchMetrics = () => api.get('/metrics').then((r) => r.data);
export const fetchClients = () => api.get('/clients').then((r) => r.data);
export const fetchAppointments = () => api.get('/appointments').then((r) => r.data);
export const fetchMessages = () => api.get('/messages').then((r) => r.data);

export const createClient = (data) => api.post('/clients', data).then((r) => r.data);
export const createAppointment = (data) => api.post('/appointments', data).then((r) => r.data);
export const sendMessage = (data) => api.post('/messages/webhook', data).then((r) => r.data);

export default api;