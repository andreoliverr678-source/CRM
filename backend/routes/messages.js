const express = require('express');
const router = express.Router();
const supabase = require('../db');
const { mockMessages } = require('../mockData');

// Get all messages
router.get('/', async (req, res) => {
  if (!supabase) {
    return res.json(mockMessages);
  }
  
  const { data, error } = await supabase.from('messages').select('*').order('timestamp', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Webhook for n8n to send new messages received via WhatsApp
router.post('/webhook', async (req, res) => {
  const messageData = req.body;
  
  if (!supabase) {
    mockMessages.push({ id: Date.now(), ...messageData, timestamp: new Date().toISOString() });
    return res.status(200).json({ status: 'received' });
  }

  const { error } = await supabase.from('messages').insert([{
    ...messageData,
    timestamp: new Date().toISOString()
  }]);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ status: 'received' });
});

module.exports = router;
