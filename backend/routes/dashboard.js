const express = require('express');
const router = express.Router();
const supabase = require('../db');
const { startOfWeek, endOfWeek, format, parseISO, isValid, getDay } = require('date-fns');

// GET /api/dashboard
router.get('/', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Obter data do início e fim do mês
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    // Início e fim da semana
    const startWeek = startOfWeek(now, { weekStartsOn: 1 }).toISOString().split('T')[0]; // Segunda
    const endWeek = endOfWeek(now, { weekStartsOn: 1 }).toISOString().split('T')[0]; // Domingo

    // 1. Total Clientes
    const { count: totalClients } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true });

    // 2. Agendamentos Hoje
    const { count: appointmentsToday } = await supabase
      .from('agendamentos')
      .select('*', { count: 'exact', head: true })
      .eq('data', today);

    // 3. Conversas Ativas (últimas 24h)
    const { data: conversas } = await supabase
      .from('conversas')
      .select('telefone')
      .gte('criado_em', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    const activeConversations = conversas ? new Set(conversas.map(c => c.telefone)).size : 0;

    // 4. Faturamento Mensal (estimado: R$ 50 por agendamento concluído no mês)
    const { data: monthAppointments } = await supabase
      .from('agendamentos')
      .select('id, servico, hora, status, data')
      .gte('data', firstDayOfMonth)
      .lte('data', lastDayOfMonth);
    
    // Filtra concluídos ou confirmados do mês para faturamento (ex: R$ 50 medio)
    const completedMonth = (monthAppointments || []).filter(a => a.status === 'concluido' || a.status === 'confirmado');
    const revenue = completedMonth.length * 50; // Estimativa de R$ 50 por corte

    // 5. Serviços populares
    const servicesCount = {};
    (monthAppointments || []).forEach(a => {
      const s = a.servico || 'Corte Padrão';
      servicesCount[s] = (servicesCount[s] || 0) + 1;
    });
    const popularServices = Object.entries(servicesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    // 6. Atendimentos Semanais (Gráfico)
    const { data: weekAppointments } = await supabase
      .from('agendamentos')
      .select('data')
      .gte('data', startWeek)
      .lte('data', endWeek)
      .neq('status', 'cancelado');

    const daysMap = { 'Seg': 0, 'Ter': 0, 'Qua': 0, 'Qui': 0, 'Sex': 0, 'Sáb': 0, 'Dom': 0 };
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    (weekAppointments || []).forEach(a => {
      const date = parseISO(a.data);
      if (isValid(date)) {
        const dayIndex = getDay(date);
        const dayName = dayNames[dayIndex];
        if (daysMap[dayName] !== undefined) {
          daysMap[dayName]++;
        }
      }
    });
    
    // Ordenar a semana (Segunda a Domingo)
    const chartData = [
      { name: 'Seg', atendimentos: daysMap['Seg'] },
      { name: 'Ter', atendimentos: daysMap['Ter'] },
      { name: 'Qua', atendimentos: daysMap['Qua'] },
      { name: 'Qui', atendimentos: daysMap['Qui'] },
      { name: 'Sex', atendimentos: daysMap['Sex'] },
      { name: 'Sáb', atendimentos: daysMap['Sáb'] },
      { name: 'Dom', atendimentos: daysMap['Dom'] },
    ];

    // 7. Horários mais usados
    const timesCount = {};
    (monthAppointments || []).forEach(a => {
      if (a.hora) {
        const hour = a.hora.substring(0, 5); // Pega HH:mm
        timesCount[hour] = (timesCount[hour] || 0) + 1;
      }
    });
    const popularTimes = Object.entries(timesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([time, count]) => ({ time, count }));

    res.json({
      totalClients: totalClients || 0,
      appointmentsToday: appointmentsToday || 0,
      activeConversations: activeConversations || 0,
      revenue: revenue,
      popularServices,
      popularTimes,
      chartData
    });

  } catch (err) {
    console.error('[dashboard] Erro inesperado:', err.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
