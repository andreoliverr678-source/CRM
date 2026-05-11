const express = require('express');
const router = express.Router();
const supabase = require('../db');

// ─── Helpers ────────────────────────────────────────────────────────────────

function getDateRange(period) {
  const now = new Date();
  let start, end;

  switch (period) {
    case 'daily':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end   = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      break;
    case 'weekly': {
      const day = now.getDay(); // 0=Dom
      const diff = (day === 0) ? -6 : 1 - day; // Segunda
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
      end   = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
      break;
    }
    case 'monthly':
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end   = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;
  }

  return { start: start.toISOString(), end: end.toISOString() };
}

// ─── GET /api/financial/revenue ─────────────────────────────────────────────
// Retorna métricas de faturamento: diário, semanal, mensal, ticket médio,
// serviço mais vendido.
router.get('/revenue', async (req, res) => {
  try {
    const now = new Date();

    // Ranges
    const daily  = getDateRange('daily');
    const weekly = getDateRange('weekly');
    const monthly = getDateRange('monthly');

    // Busca todos os registros pagos do mês (para cálculos mensais + ticket médio)
    const { data: monthRecords, error: monthErr } = await supabase
      .from('financial_records')
      .select('amount, service, payment_method, created_at')
      .eq('status', 'pago')
      .gte('created_at', monthly.start)
      .lt('created_at', monthly.end);

    if (monthErr) throw monthErr;

    // Faturamento mensal
    const revenueMonthly = (monthRecords || []).reduce((acc, r) => acc + Number(r.amount), 0);

    // Ticket médio
    const avgTicket = monthRecords && monthRecords.length > 0
      ? revenueMonthly / monthRecords.length
      : 0;

    // Serviço mais vendido (mês)
    const servicesCount = {};
    (monthRecords || []).forEach(r => {
      const s = r.service || 'Outros';
      servicesCount[s] = (servicesCount[s] || 0) + 1;
    });
    const topService = Object.entries(servicesCount)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))[0] || null;

    // Faturamento semanal
    const { data: weekRecords, error: weekErr } = await supabase
      .from('financial_records')
      .select('amount')
      .eq('status', 'pago')
      .gte('created_at', weekly.start)
      .lt('created_at', weekly.end);
    if (weekErr) throw weekErr;
    const revenueWeekly = (weekRecords || []).reduce((acc, r) => acc + Number(r.amount), 0);

    // Faturamento diário
    const { data: dayRecords, error: dayErr } = await supabase
      .from('financial_records')
      .select('amount')
      .eq('status', 'pago')
      .gte('created_at', daily.start)
      .lt('created_at', daily.end);
    if (dayErr) throw dayErr;
    const revenueDaily = (dayRecords || []).reduce((acc, r) => acc + Number(r.amount), 0);

    // Breakdown por método de pagamento (mês)
    const paymentBreakdown = {};
    (monthRecords || []).forEach(r => {
      const m = r.payment_method || 'nao_informado';
      paymentBreakdown[m] = (paymentBreakdown[m] || 0) + Number(r.amount);
    });

    res.json({
      revenueMonthly,
      revenueWeekly,
      revenueDaily,
      avgTicket,
      topService,
      paymentBreakdown,
      period: {
        daily:   { start: daily.start,   end: daily.end },
        weekly:  { start: weekly.start,  end: weekly.end },
        monthly: { start: monthly.start, end: monthly.end },
      },
    });
  } catch (err) {
    console.error('[financial] Erro ao calcular revenue:', err.message);
    res.status(500).json({ error: 'Erro ao calcular faturamento', details: err.message });
  }
});

// ─── GET /api/financial ──────────────────────────────────────────────────────
// Lista registros financeiros com filtros opcionais:
//   ?status=pago&payment_method=pix&period=monthly&page=1&limit=50
router.get('/', async (req, res) => {
  try {
    const { status, payment_method, period = 'monthly', page = 1, limit = 50 } = req.query;
    const { start, end } = getDateRange(period);

    let query = supabase
      .from('financial_records')
      .select('*')
      .gte('created_at', start)
      .lt('created_at', end)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status)         query = query.eq('status', status);
    if (payment_method) query = query.eq('payment_method', payment_method);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ data: data || [], total: count || data?.length || 0, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('[financial] Erro ao listar registros:', err.message);
    res.status(500).json({ error: 'Erro ao listar registros financeiros', details: err.message });
  }
});

// ─── POST /api/financial ─────────────────────────────────────────────────────
// Cria / atualiza manualmente um registro financeiro.
// Body: { appointment_id, client_id, service, amount, payment_method, status }
router.post('/', async (req, res) => {
  try {
    const {
      appointment_id,
      client_id,
      service,
      amount,
      payment_method,
      status = 'pago',
    } = req.body;

    // Se amount não foi enviado, tenta buscar pelo appointment_id ou service
    let finalAmount = amount;
    if (finalAmount === undefined || finalAmount === null) {
      if (appointment_id) {
        // Busca o preco do servico vinculado ao agendamento
        const { data: apt, error: aptErr } = await supabase
          .from('agendamentos')
          .select('service_id, servico')
          .eq('id', appointment_id)
          .single();
        
        if (!aptErr && apt) {
          let priceSourceId = apt.service_id;
          
          // Se não tem service_id, tenta buscar pelo nome do serviço
          if (!priceSourceId && apt.servico) {
            const { data: srv, error: srvErr } = await supabase
              .from('servicos')
              .select('id')
              .ilike('nome', apt.servico.trim())
              .limit(1)
              .maybeSingle();
            if (srv) {
              priceSourceId = srv.id;
            }
          }

          if (priceSourceId) {
            const { data: srvData, error: srvPriceErr } = await supabase
              .from('servicos')
              .select('preco')
              .eq('id', priceSourceId)
              .single();
            if (srvData) {
              finalAmount = srvData.preco;
            }
          }
        }
      } else if (service) {
        // Busca o preco pelo nome do serviço
        const { data: srvData } = await supabase
          .from('servicos')
          .select('preco')
          .ilike('nome', service.trim())
          .limit(1)
          .maybeSingle();
        if (srvData) finalAmount = srvData.preco;
      }
    }

    // Se ainda assim não tiver amount, retorna erro ou assume 0 (melhor retornar erro se real values são necessários)
    if (finalAmount === undefined || finalAmount === null) {
      return res.status(400).json({ error: 'O campo "amount" é obrigatório e não pôde ser determinado automaticamente.' });
    }

    // Se há appointment_id, tenta atualizar registro existente
    if (appointment_id) {
      const { data: existing } = await supabase
        .from('financial_records')
        .select('id')
        .eq('appointment_id', appointment_id)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('financial_records')
          .update({ service, amount: Number(finalAmount), payment_method, status })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;

        // Emite evento Socket.io se disponível
        const io = req.app.get('io');
        if (io) io.emit('financial_updated', data);

        return res.json({ updated: true, data });
      }
    }

    // Cria novo registro
    const { data, error } = await supabase
      .from('financial_records')
      .insert([{
        appointment_id: appointment_id || null,
        client_id:      client_id || null,
        service,
        amount:         Number(finalAmount),
        payment_method: payment_method || null,
        status,
      }])
      .select()
      .single();

    if (error) throw error;

    // Emite evento Socket.io
    const io = req.app.get('io');
    if (io) io.emit('financial_new', data);

    res.status(201).json({ updated: false, data });
  } catch (err) {
    console.error('[financial] Erro ao criar registro:', err.message);
    res.status(500).json({ error: 'Erro ao criar registro financeiro', details: err.message });
  }
});

// ─── PUT /api/financial/:id ───────────────────────────────────────────────────
// Atualiza um registro existente (ex: definir payment_method após conclusão)
router.put('/:id', async (req, res) => {
  try {
    const { payment_method, status, amount } = req.body;
    const updates = {};
    if (payment_method !== undefined) updates.payment_method = payment_method;
    if (status !== undefined)         updates.status = status;
    if (amount !== undefined)         updates.amount = Number(amount);

    const { data, error } = await supabase
      .from('financial_records')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    const io = req.app.get('io');
    if (io) io.emit('financial_updated', data);

    res.json(data);
  } catch (err) {
    console.error('[financial] Erro ao atualizar registro:', err.message);
    res.status(500).json({ error: 'Erro ao atualizar registro financeiro', details: err.message });
  }
});

module.exports = router;
