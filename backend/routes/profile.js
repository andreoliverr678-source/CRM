const express = require('express');
const router = express.Router();
const supabase = require('../db');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/auth');

// GET /api/profile -> Obtém dados do usuário (também coberto por /api/auth/me)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, avatar, barbershop_name')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'Perfil não encontrado' });
    }

    res.json(user);
  } catch (err) {
    console.error('[PROFILE] Erro:', err.message);
    res.status(500).json({ error: 'Erro interno ao buscar perfil' });
  }
});

// PUT /api/profile -> Atualiza dados
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { name, email, barbershop_name, avatar } = req.body;

    // TODO: Se email mudar, verificar se já existe
    const { data, error } = await supabase
      .from('users')
      .update({ name, email, barbershop_name, avatar })
      .eq('id', req.user.id)
      .select('id, name, email, avatar, barbershop_name')
      .single();

    if (error) {
      console.error('[PROFILE] Erro ao atualizar:', error.message);
      return res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }

    res.json(data);
  } catch (err) {
    console.error('[PROFILE] Erro inesperado:', err.message);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// PUT /api/profile/password -> Altera senha
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Senha atual e nova são obrigatórias' });
    }

    // Busca usuário com hash
    const { data: user, error } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Valida senha atual
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    // Hash nova senha
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    // Atualiza
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newHash })
      .eq('id', req.user.id);

    if (updateError) {
      return res.status(500).json({ error: 'Erro ao salvar nova senha' });
    }

    res.json({ success: true, message: 'Senha atualizada com sucesso' });
  } catch (err) {
    console.error('[PROFILE] Erro inesperado ao trocar senha:', err.message);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
