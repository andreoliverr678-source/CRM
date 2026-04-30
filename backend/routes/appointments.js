const express = require('express');
const router = express.Router();
const supabase = require('../db');
const { mockAppointments } = require('../mockData');

router.get('/', async (req, res) => {
  if (!supabase) {
    return res.json(mockAppointments);
  }
  
  const { data, error } = await supabase.from('appointments').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  if (!supabase) {
    const newAppointment = { id: Date.now(), ...req.body };
    mockAppointments.push(newAppointment);
    return res.status(201).json(newAppointment);
  }

  const { data, error } = await supabase.from('appointments').insert([req.body]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

module.exports = router;
