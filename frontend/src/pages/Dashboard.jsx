import React from 'react';
import { Users, Calendar, MessageSquare, ArrowUpRight, RefreshCw, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useApi from '../hooks/useApi';
import { fetchMetrics } from '../services/api';

// ------- Skeleton -------
const StatSkeleton = () => (
  <div className="glass-panel p-4 md:p-6 rounded-2xl animate-pulse">
    <div className="flex justify-between items-start mb-3 md:mb-4">
      <div className="w-10 h-10 rounded-xl bg-dark-200 dark:bg-dark-700" />
      <div className="w-14 h-5 rounded-full bg-dark-200 dark:bg-dark-700" />
    </div>
    <div className="h-3 w-20 rounded bg-dark-200 dark:bg-dark-700 mb-2" />
    <div className="h-7 w-14 rounded bg-dark-200 dark:bg-dark-700" />
  </div>
);

// ------- Stat Card -------
const StatCard = ({ title, value, icon: Icon, trend, trendValue, colorClass }) => (
  <div className="glass-panel p-4 md:p-6 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-2xl duration-300 active:scale-95">
    <div className="flex justify-between items-start mb-3 md:mb-4">
      <div className={`p-2.5 md:p-3 rounded-xl ${colorClass}`}>
        <Icon size={20} />
      </div>
      {trend === 'up' && (
        <span className="flex items-center text-xs font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
          <ArrowUpRight size={14} className="mr-0.5" />
          {trendValue}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-dark-500 dark:text-dark-400 text-xs md:text-sm font-medium mb-1">{title}</h3>
      <h2 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white">{value}</h2>
    </div>
  </div>
);

// Dados fixos do gráfico (placeholder visual)
const chartData = [
  { name: 'Seg', atendimentos: 3 },
  { name: 'Ter', atendimentos: 5 },
  { name: 'Qua', atendimentos: 4 },
  { name: 'Qui', atendimentos: 7 },
  { name: 'Sex', atendimentos: 9 },
  { name: 'Sáb', atendimentos: 12 },
  { name: 'Dom', atendimentos: 6 },
];

// ------- Dashboard -------
const Dashboard = () => {
  const { data: metrics, loading, error, refetch } = useApi(fetchMetrics, { interval: 30_000 });

  return (
    <div className="space-y-4 md:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white mb-1">
            Visão Geral
          </h1>
          <p className="text-sm text-dark-500 dark:text-dark-400 hidden sm:block">
            Acompanhe os resultados da sua barbearia hoje.
          </p>
        </div>
        <button
          onClick={refetch}
          title="Atualizar métricas"
          className="p-2.5 rounded-xl text-dark-400 hover:text-dark-900 dark:hover:text-white hover:bg-dark-100 dark:hover:bg-dark-800 transition-all active:scale-90"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          <AlertCircle size={16} className="shrink-0" />
          <span className="text-xs md:text-sm">Erro ao carregar métricas: {error}</span>
        </div>
      )}

      {/* Stat Cards — 1 col mobile, 2 col sm, 3 col lg */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {loading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Agendamentos Hoje"
              value={metrics?.appointmentsToday ?? 0}
              icon={Calendar}
              trend="up"
              trendValue="hoje"
              colorClass="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
            />
            <StatCard
              title="Total de Clientes"
              value={metrics?.totalClients ?? 0}
              icon={Users}
              trend="up"
              trendValue="total"
              colorClass="bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
            />
            <StatCard
              title="Conversas Ativas (24h)"
              value={metrics?.activeConversations ?? 0}
              icon={MessageSquare}
              colorClass="bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
            />
          </>
        )}
      </div>

      {/* Chart */}
      <div className="glass-panel p-4 md:p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-bold text-dark-900 dark:text-white">
            Atendimentos da Semana
          </h3>
          <span className="text-xs text-dark-400 dark:text-dark-500 bg-dark-100 dark:bg-dark-800 px-2.5 py-1 rounded-full">
            Estimativa
          </span>
        </div>
        {/* Scroll horizontal no mobile se o gráfico ficar apertado */}
        <div className="overflow-x-auto -mx-1">
          <div className="min-w-[300px]">
            <div className="h-[160px] md:h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                    itemStyle={{ color: '#22c55e' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="atendimentos"
                    stroke="#22c55e"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorApt)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
