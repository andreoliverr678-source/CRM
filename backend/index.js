const express = require('express');
const cors = require('cors');
require('dotenv').config({ override: true });

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rotas
const clientsRouter = require('./routes/clients');
const appointmentsRouter = require('./routes/appointments');
const metricsRouter = require('./routes/metrics');
const messagesRouter = require('./routes/messages');

app.use('/api/clients', clientsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/metrics', metricsRouter);
app.use('/api/messages', messagesRouter);

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CRM API is running',
    supabase: process.env.SUPABASE_URL ? 'connected' : 'not configured',
    timestamp: new Date().toISOString(),
  });
});

// Handler global para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
});

// Handler global de erros
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Servidor rodando na porta ${port}`);
  console.log(`🔗 Supabase URL: ${process.env.SUPABASE_URL}`);
});