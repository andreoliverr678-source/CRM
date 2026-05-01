const express = require('express');
const router = express.Router();
const supabase = require('../db');

// GET /api/messages — busca todas as conversas
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('conversas')
      .select('*')
      .order('criado_em', { ascending: true });

    if (error) {
      console.error('[messages] Erro ao buscar conversas:', error.message);
      return res.status(500).json({ error: 'Erro ao buscar conversas', details: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error('[messages] Erro inesperado:', err.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/messages/webhook — webhook do n8n para mensagens WhatsApp recebidas
router.post('/webhook', async (req, res) => {
  try {
    const { telefone, mensagem, origem, tipo } = req.body;

    if (!mensagem || !telefone) {
      return res.status(400).json({ error: 'Os campos "mensagem" e "telefone" são obrigatórios' });
    }

    const { error } = await supabase
      .from('conversas')
      .insert([{
        telefone,
        mensagem,
        origem: origem || 'whatsapp',
        tipo: tipo || 'humano',
        criado_em: new Date().toISOString(),
      }]);

    if (error) {
      console.error('[messages] Erro ao salvar mensagem:', error.message);
      return res.status(500).json({ error: 'Erro ao salvar mensagem', details: error.message });
    }

    res.status(200).json({ status: 'received' });
  } catch (err) {
    console.error('[messages] Erro inesperado:', err.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
