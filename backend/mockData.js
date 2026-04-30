const mockClients = [
  { id: 1, name: 'João Silva', phone: '+55 11 99999-1111', last_visit: '2026-04-20' },
  { id: 2, name: 'Carlos Santos', phone: '+55 11 98888-2222', last_visit: '2026-04-28' },
  { id: 3, name: 'Marcos Oliveira', phone: '+55 11 97777-3333', last_visit: '2026-03-15' },
];

const mockAppointments = [
  { id: 1, client_id: 1, client_name: 'João Silva', date: '2026-04-30', time: '14:00', service: 'Corte de Cabelo', status: 'confirmed' },
  { id: 2, client_id: 2, client_name: 'Carlos Santos', date: '2026-04-30', time: '15:30', service: 'Barba', status: 'pending' },
];

const mockMessages = [
  { id: 1, client_name: 'João Silva', text: 'Bom dia, posso agendar para hoje à tarde?', direction: 'in', timestamp: '2026-04-30T09:00:00Z' },
  { id: 2, client_name: 'Barbearia', text: 'Bom dia João! Temos vaga às 14:00. Pode ser?', direction: 'out', timestamp: '2026-04-30T09:05:00Z' },
];

const mockMetrics = {
  totalClients: 145,
  appointmentsToday: 12,
  revenueMonth: 8500,
  activeConversations: 5
};

module.exports = {
  mockClients,
  mockAppointments,
  mockMessages,
  mockMetrics
};
