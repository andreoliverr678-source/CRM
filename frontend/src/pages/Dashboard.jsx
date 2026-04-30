import React, { useEffect, useState } from 'react';
import { Users, TrendingUp, Calendar, Clock, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, colorClass }) => (
  <div className="glass-panel p-6 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-2xl duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon size={24} />
      </div>
      {trend === 'up' && (
        <span className="flex items-center text-sm font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full">
          <ArrowUpRight size={16} className="mr-1" />
          {trendValue}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-dark-500 dark:text-dark-400 text-sm font-medium mb-1">{title}</h3>
      <h2 className="text-3xl font-bold text-dark-900 dark:text-white">{value}</h2>
    </div>
  </div>
);

const chartData = [
  { name: 'Seg', revenue: 400 },
  { name: 'Ter', revenue: 600 },
  { name: 'Qua', revenue: 500 },
  { name: 'Qui', revenue: 800 },
  { name: 'Sex', revenue: 1200 },
  { name: 'Sáb', revenue: 1600 },
  { name: 'Dom', revenue: 900 },
];

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalClients: 0,
    appointmentsToday: 0,
    revenueMonth: 0,
    activeConversations: 0
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await axios.get(`${API_URL}/metrics`);
        setMetrics(res.data);
      } catch (error) {
        console.error('Error fetching metrics', error);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">Visão Geral</h1>
          <p className="text-dark-500 dark:text-dark-400">Acompanhe os resultados da sua barbearia hoje.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Faturamento Mensal" 
          value={`R$ ${metrics.revenueMonth.toLocaleString('pt-BR')}`} 
          icon={TrendingUp} 
          trend="up" 
          trendValue="+12%"
          colorClass="bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400"
        />
        <StatCard 
          title="Agendamentos Hoje" 
          value={metrics.appointmentsToday} 
          icon={Calendar} 
          trend="up" 
          trendValue="+3"
          colorClass="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
        />
        <StatCard 
          title="Total de Clientes" 
          value={metrics.totalClients} 
          icon={Users} 
          trend="up" 
          trendValue="+18"
          colorClass="bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
        />
        <StatCard 
          title="Conversas Ativas" 
          value={metrics.activeConversations} 
          icon={Clock} 
          colorClass="bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
        />
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-6">Faturamento da Semana</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                itemStyle={{ color: '#22c55e' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
