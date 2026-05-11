const fs = require('fs');

const filePath = 'c:\\Users\\adasilva\\Downloads\\CRM\\n8n_workflows.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// 1. Find the "Barbearia" workflow
const workflow = data.data.find(w => w.name === 'Barbearia');
if (!workflow) {
  console.error('Workflow Barbearia not found');
  process.exit(1);
}

// 2. Add the "confirmar_agendamento" tool node
const confirmNode = {
  "parameters": {
    "operation": "update",
    "tableId": "agendamentos",
    "filters": {
      "conditions": [
        {
          "keyName": "telefone",
          "condition": "eq",
          "keyValue": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('telefone', `Telefone do cliente para confirmar`, 'string') }}"
        },
        {
          "keyName": "status",
          "condition": "eq",
          "keyValue": "pendente"
        }
      ]
    },
    "fieldsUi": {
      "fieldValues": [
        {
          "fieldId": "status",
          "fieldValue": "confirmado"
        }
      ]
    }
  },
  "type": "n8n-nodes-base.supabaseTool",
  "typeVersion": 1,
  "position": [12336, 8048],
  "id": "confirmar-tool-node",
  "name": "confirmar_agendamento",
  "credentials": {
    "supabaseApi": {
      "id": "HoI9l5OTgXnvzb6O",
      "name": "Supabase account"
    }
  }
};

workflow.nodes.push(confirmNode);

// 3. Connect the tool to the AI agent
// The AI agent node ID is "11501ebb-b3c3-4b50-8992-07559d1b9064"
if (!workflow.connections["confirmar_agendamento"]) {
  workflow.connections["confirmar_agendamento"] = {
    "ai_tool": [
      [
        {
          "node": "André, Atendente",
          "type": "ai_tool",
          "index": 0
        }
      ]
    ]
  };
}

// 4. Update the systemMessage
const aiNode = workflow.nodes.find(n => n.name === 'André, Atendente');
if (aiNode) {
  let prompt = aiNode.parameters.options.systemMessage;
  
  // Ensure we are using "pendente" for new agendamentos
  prompt = prompt.replace(/"status": "confirmado"/g, '"status": "pendente"');
  
  // Add confirmation logic
  if (!prompt.includes('CONFIRMAÇÃO')) {
    const confirmationSection = `
---

🧠 CONFIRMAÇÃO
Se o cliente responder "SIM", "Confirmar", "Pode confirmar" ou algo positivo após o lembrete de 24h:
→ OBRIGATÓRIO chamar "confirmar_agendamento" passando o telefone {{ $json.telefone }}

---
`;
    prompt = prompt.replace('---\n\n3. Resposta final:', confirmationSection + '\n---\n\n3. Resposta final:');
    
    // Update response final
    prompt = prompt.replace('Fechou {{ $json.nome }}, te coloquei {{ $json.data }} às {{ $json.hora }} 👍', 
      'Fechou {{ $json.nome }}, agendei para {{ $json.data }} às {{ $json.hora }}. \\n\\n⚠️ Atenção: Vou te mandar uma mensagem 24h antes para você confirmar, beleza? Fica de olho! 👍');
  }
  
  aiNode.parameters.options.systemMessage = prompt;
}

// 5. Update the Follow-up workflow
const followupWorkflow = data.data.find(w => w.name === 'Barbearia - Follow-up & Reativação' || w.name === 'fallowup');
if (followupWorkflow) {
  const node24h = followupWorkflow.nodes.find(n => n.name === 'Agendamentos - Lembrete 24h');
  if (node24h) {
    node24h.parameters.filterString = node24h.parameters.filterString.replace('status=eq.confirmado', 'status=eq.pendente');
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('n8n_workflows.json updated successfully');
