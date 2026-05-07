const express = require('express');
const router = express.Router();
const supabase = require('../db');

// GET /api/clients — busca todos os clientes
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

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

// GET /api/clients/:id — busca cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      console.error('[clients] Erro ao buscar cliente:', error.message);
      return res.status(500).json({ error: 'Erro ao buscar cliente', details: error.message });
    }

    if (!data) return res.status(404).json({ error: 'Cliente não encontrado' });

    res.json(data);
  } catch (err) {
    console.error('[clients] Erro inesperado:', err.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/clients — cria um novo cliente
router.post('/', async (req, res) => {
  try {
    const { name, phone, status, notes } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'O campo "phone" é obrigatório' });
    }

    const { data, error } = await supabase
      .from('clients')
      .insert([{ name, phone, status, notes }])
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

// PUT /api/clients/:id — atualiza um cliente
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, status, notes } = req.body;

    const { data, error } = await supabase
      .from('clients')
      .update({ name, phone, status, notes, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      console.error('[clients] Erro ao atualizar cliente:', error.message);
      return res.status(500).json({ error: 'Erro ao atualizar cliente', details: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error('[clients] Erro inesperado:', err.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/clients/:id — exclui um cliente
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('[clients] Erro ao excluir cliente:', error.message);
      return res.status(500).json({ error: 'Erro ao excluir cliente', details: error.message });
    }

    res.json({ message: 'Cliente excluído com sucesso' });
  } catch (err) {
    console.error('[clients] Erro inesperado:', err.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
