const express = require('express');
const router = express.Router();
const supabase = require('../db');
const authMiddleware = require('../middleware/auth');

// GET /api/notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[NOTIF] Erro ao buscar:', error.message);
      return res.status(500).json({ error: 'Erro ao buscar notificações' });
    }

    res.json(data);
  } catch (err) {
    console.error('[NOTIF] Erro inesperado:', err.message);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', req.user.id) // Garante que é do usuário logado
      .select()
      .single();

    if (error) {
      console.error('[NOTIF] Erro ao marcar lida:', error.message);
      return res.status(500).json({ error: 'Erro ao atualizar notificação' });
    }

    res.json(data);
  } catch (err) {
    console.error('[NOTIF] Erro inesperado:', err.message);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', req.user.id)
      .eq('read', false)
      .select();

    if (error) {
      console.error('[NOTIF] Erro ao marcar todas lidas:', error.message);
      return res.status(500).json({ error: 'Erro ao atualizar notificações' });
    }

    res.json(data);
  } catch (err) {
    console.error('[NOTIF] Erro inesperado:', err.message);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
