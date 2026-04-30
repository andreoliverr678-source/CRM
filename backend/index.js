const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
const clientsRouter = require('./routes/clients');
const appointmentsRouter = require('./routes/appointments');
const metricsRouter = require('./routes/metrics');
const messagesRouter = require('./routes/messages');

app.use('/api/clients', clientsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/metrics', metricsRouter);
app.use('/api/messages', messagesRouter);

app.get('/', (req, res) => {
  res.send('CRM API is running');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
