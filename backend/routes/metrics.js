const express = require('express');
const router = express.Router();
const supabase = require('../db');
const { mockMetrics } = require('../mockData');

router.get('/', async (req, res) => {
  if (!supabase) {
    return res.json(mockMetrics);
  }
  
  // Example of how we might aggregate data if we had real Supabase setup
  // For now we just return mock or fetch a pre-calculated table if it existed
  // In a real app we'd do complex count queries
  return res.json(mockMetrics); 
});

module.exports = router;
