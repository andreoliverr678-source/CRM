const express = require('express');
const router = express.Router();
const supabase = require('../db');

// GET /api/clients — busca todos os clientes
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) {
      console.error('[clients] Erro ao buscar clientes:', error.message);
      return res.status(500).json({ error: 'Erro ao buscar clientes', details: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error('[clients] Erro inesperado:', err.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/clients — cria um novo cliente
router.post('/', async (req, res) => {
  try {
    const { nome, telefone, status, observacoes, score } = req.body;

    if (!telefone) {
      return res.status(400).json({ error: 'O campo "telefone" é obrigatório' });
    }

    const { data, error } = await supabase
      .from('clientes')
      .insert([{ nome, telefone, status, observacoes, score }])
      .select()
      .single();

    if (error) {
      console.error('[clients] Erro ao criar cliente:', error.message);
      return res.status(500).json({ error: 'Erro ao criar cliente', details: error.message });
    }

    res.status(201).json(data);
  } catch (err) {
    console.error('[clients] Erro inesperado:', err.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
