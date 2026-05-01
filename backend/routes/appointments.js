const express = require('express');
const router = express.Router();
const supabase = require('../db');

// GET /api/appointments — busca todos os agendamentos
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('agendamentos')
      .select('*')
      .order('data', { ascending: true })
      .order('hora', { ascending: true });

    if (error) {
      console.error('[appointments] Erro ao buscar agendamentos:', error.message);
      return res.status(500).json({ error: 'Erro ao buscar agendamentos', details: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error('[appointments] Erro inesperado:', err.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/appointments — cria um novo agendamento
router.post('/', async (req, res) => {
  try {
    const { telefone, nome, servico, data, hora, status } = req.body;

    if (!telefone || !data || !hora) {
      return res.status(400).json({ error: 'Os campos "telefone", "data" e "hora" são obrigatórios' });
    }

    const { data: created, error } = await supabase
      .from('agendamentos')
      .insert([{ telefone, nome, servico, data, hora, status: status || 'confirmado' }])
      .select()
      .single();

    if (error) {
      console.error('[appointments] Erro ao criar agendamento:', error.message);
      return res.status(500).json({ error: 'Erro ao criar agendamento', details: error.message });
    }

    res.status(201).json(created);
  } catch (err) {
    console.error('[appointments] Erro inesperado:', err.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
