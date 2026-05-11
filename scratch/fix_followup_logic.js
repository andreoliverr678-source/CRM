const fs = require('fs');

const filePath = 'c:\\Users\\adasilva\\Downloads\\CRM\\n8n_workflows.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Function to fix a workflow object
function fixFollowupWorkflow(workflow) {
  if (!workflow || !workflow.nodes) return;

  workflow.nodes.forEach(node => {
    // Fix 24h Reminder
    if (node.name === 'Agendamentos - Lembrete 24h' && node.parameters) {
      node.parameters.filterString = "=status=eq.pendente&lembrete_24h_enviado=eq.false&data_hora_agendamento=gte.{{$now.setZone('America/Sao_Paulo').plus(12,'hours').toISO()}}&data_hora_agendamento=lte.{{$now.setZone('America/Sao_Paulo').plus(36,'hours').toISO()}}";
    }
    
    // Fix 2h Reminder
    if (node.name === 'Agendamentos - Lembrete 2h' && node.parameters) {
      node.parameters.filterString = "=status=eq.confirmado&lembrete_2h_enviado=eq.false&data_hora_agendamento=gte.{{$now.setZone('America/Sao_Paulo').minus(1,'hour').toISO()}}&data_hora_agendamento=lte.{{$now.setZone('America/Sao_Paulo').plus(4,'hours').toISO()}}";
    }

    // Ensure Marcar nodes have tableId set correctly (just in case)
    if (node.name === 'Marcar 24h Enviado' || node.name === 'Marcar 2h Enviado') {
      if (node.parameters) node.parameters.tableId = 'agendamentos';
    }
  });

  // If there's an activeVersion, sync its nodes too
  if (workflow.activeVersion && workflow.activeVersion.nodes) {
    workflow.activeVersion.nodes.forEach(node => {
      if (node.name === 'Agendamentos - Lembrete 24h' && node.parameters) {
        node.parameters.filterString = "=status=eq.pendente&lembrete_24h_enviado=eq.false&data_hora_agendamento=gte.{{$now.setZone('America/Sao_Paulo').plus(12,'hours').toISO()}}&data_hora_agendamento=lte.{{$now.setZone('America/Sao_Paulo').plus(36,'hours').toISO()}}";
      }
      if (node.name === 'Agendamentos - Lembrete 2h' && node.parameters) {
        node.parameters.filterString = "=status=eq.confirmado&lembrete_2h_enviado=eq.false&data_hora_agendamento=gte.{{$now.setZone('America/Sao_Paulo').minus(1,'hour').toISO()}}&data_hora_agendamento=lte.{{$now.setZone('America/Sao_Paulo').plus(4,'hours').toISO()}}";
      }
    });
  }
}

// 1. Find and fix "Barbearia - Follow-up & Reativação"
const fw = data.data.find(w => w.name === 'Barbearia - Follow-up & Reativação');
if (fw) {
  fixFollowupWorkflow(fw);
}

// 2. Just in case, fix any node with these names anywhere in the file
data.data.forEach(w => fixFollowupWorkflow(w));

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('n8n_workflows.json updated: Follow-up logic hardened and windows widened.');
