const fs = require('fs');

const filePath = 'c:\\Users\\adasilva\\Downloads\\CRM\\n8n_workflows.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// 1. Find the "Barbearia" workflow
const workflow = data.data.find(w => w.name === 'Barbearia');
if (workflow) {
  const aiNode = workflow.nodes.find(n => n.name === 'André, Atendente' || n.name.includes('Andr'));
  if (aiNode) {
    let prompt = aiNode.parameters.options.systemMessage;
    
    // Force "pendente" status in the agendar tool call section
    // Look for the JSON block in the prompt
    prompt = prompt.replace(/"status":\s*"(confirmado|agendado|cliente|lead)"/g, '"status": "pendente"');
    
    // Make the instruction even stricter
    if (!prompt.includes('⚠️ REGRA DE STATUS')) {
      const statusRule = `
⚠️ REGRA DE STATUS (CRÍTICA)
Todo novo agendamento DEVE ser criado com status: "pendente".
NUNCA use "confirmado" ou outro status na criação inicial.
`;
      prompt = statusRule + prompt;
    }
    
    aiNode.parameters.options.systemMessage = prompt;
  }
}

// 2. Update the Follow-up workflow
const followupWorkflow = data.data.find(w => w.name === 'Barbearia - Follow-up & Reativação' || w.name === 'fallowup');
if (followupWorkflow) {
  // 24h reminder should target PENDENTE
  const node24h = followupWorkflow.nodes.find(n => n.name === 'Agendamentos - Lembrete 24h');
  if (node24h) {
    node24h.parameters.filterString = node24h.parameters.filterString.replace(/status=eq\.(confirmado|agendado)/g, 'status=eq.pendente');
  }
  
  // 2h reminder should target CONFIRMADO
  const node2h = followupWorkflow.nodes.find(n => n.name === 'Agendamentos - Lembrete 2h');
  if (node2h) {
    node2h.parameters.filterString = node2h.parameters.filterString.replace(/status=eq\.(pendente|agendado)/g, 'status=eq.confirmado');
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('n8n_workflows.json updated with strict status rules');
