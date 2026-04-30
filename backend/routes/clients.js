const express = require('express');
const router = express.Router();
const supabase = require('../db');
const { mockClients } = require('../mockData');

router.get('/', async (req, res) => {
  if (!supabase) {
    return res.json(mockClients);
  }
  
  const { data, error } = await supabase.from('clients').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  if (!supabase) {
    const newClient = { id: Date.now(), ...req.body };
    mockClients.push(newClient);
    return res.status(201).json(newClient);
  }

  const { data, error } = await supabase.from('clients').insert([req.body]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

module.exports = router;
