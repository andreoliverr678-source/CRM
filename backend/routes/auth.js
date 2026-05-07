const express = require('express');
const router = express.Router();
const supabase = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_12345';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Busca usuário
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      console.error('[AUTH] Usuário não encontrado para email:', email, '| Supabase error:', error?.message);
      return res.status(401).json({ error: 'Usuário não encontrado no sistema' });
    }

    // Valida senha
    const isValid = await bcrypt.compare(password, user.password_hash);
    console.log('[AUTH] Hash DB:', user.password_hash?.slice(0,20), '| Senha recebida:', password?.length, 'chars | Match:', isValid);
    if (!isValid) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    // Gera token (24h)
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove hash da resposta
    const { password_hash, ...userWithoutPassword } = user;

    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error('[AUTH] Login erro:', err.message);
    res.status(500).json({ error: 'Erro interno no login' });
  }
});

// GET /api/auth/me (protegido)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, avatar, barbershop_name, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (err) {
    console.error('[AUTH] Me erro:', err.message);
    res.status(500).json({ error: 'Erro interno ao buscar perfil' });
  }
});

module.exports = router;
