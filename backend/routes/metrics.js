const express = require('express');
const router = express.Router();
const supabase = require('../db');

// GET /api/metrics — retorna métricas agregadas em tempo real
router.get('/', async (req, res) => {
  try {
    // Executa todas as queries em paralelo para melhor performance
    const [clientesRes, agendamentosHojeRes, conversasAtivasRes] = await Promise.all([
      // Total de clientes cadastrados
      supabase.from('clients').select('*', { count: 'exact', head: true }),

      // Agendamentos de hoje
      supabase
        .from('agendamentos')
        .select('*', { count: 'exact', head: true })
        .eq('data', new Date().toISOString().split('T')[0]),

      // Conversas ativas (últimas 24 horas)
      supabase
        .from('conversas')
        .select('telefone', { count: 'exact' })
        .gte('criado_em', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    ]);

    // Verifica erros individuais
    if (clientesRes.error) {
      console.error('[metrics] Erro ao contar clientes:', clientesRes.error.message);
      return res.status(500).json({ error: 'Erro ao calcular métricas', details: clientesRes.error.message });
    }
    if (agendamentosHojeRes.error) {
      console.error('[metrics] Erro ao contar agendamentos:', agendamentosHojeRes.error.message);
      return res.status(500).json({ error: 'Erro ao calcular métricas', details: agendamentosHojeRes.error.message });
    }
    if (conversasAtivasRes.error) {
      console.error('[metrics] Erro ao contar conversas:', conversasAtivasRes.error.message);
      return res.status(500).json({ error: 'Erro ao calcular métricas', details: conversasAtivasRes.error.message });
    }

    // Calcula conversas únicas por telefone nas últimas 24h
    const telefonesUnicos = conversasAtivasRes.data
      ? new Set(conversasAtivasRes.data.map((c) => c.telefone)).size
      : 0;

    res.json({
      totalClients: clientesRes.count ?? 0,
      appointmentsToday: agendamentosHojeRes.count ?? 0,
      activeConversations: telefonesUnicos,
    });
  } catch (err) {
    console.error('[metrics] Erro inesperado:', err.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
