const fs = require('fs');

const filePath = 'c:\\Users\\adasilva\\Downloads\\CRM\\n8n_workflows.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// 1. Find the "Barbearia" workflow
const workflow = data.data.find(w => w.name === 'Barbearia');
if (workflow) {
  // 2. Add "Buscar Agendamento" node
  const fetchAptNode = {
    "parameters": {
      "operation": "getAll",
      "tableId": "agendamentos",
      "returnAll": false,
      "limit": 1,
      "matchType": "allFilters",
      "filters": {
        "conditions": [
          {
            "keyName": "telefone",
            "condition": "eq",
            "keyValue": "={{ $json.telefone }}"
          }
        ]
      },
      "options": {
        "sort": [
          {
            "column": "criado_em",
            "order": "descending"
          }
        ]
      }
    },
    "type": "n8n-nodes-base.supabase",
    "typeVersion": 1,
    "position": [8080, 7640],
    "id": "fetch-latest-apt-node",
    "name": "Buscar Agendamento",
    "alwaysOutputData": true,
    "credentials": {
      "supabaseApi": {
        "id": "HoI9l5OTgXnvzb6O",
        "name": "Supabase account"
      }
    }
  };

  workflow.nodes.push(fetchAptNode);

  // 3. Update connections
  // Currently: Analiz Client -> Client ou não
  // Change to: Analiz Client -> Buscar Agendamento -> Client ou não
  
  const connections = workflow.connections;
  
  // Analiz Client main output 0 currently goes to "Client ou não"
  connections["Analiz Client"].main[0] = [{
    node: "Buscar Agendamento",
    type: "main",
    index: 0
  }];
  
  // Buscar Agendamento main output 0 goes to "Client ou não"
  connections["Buscar Agendamento"] = {
    main: [[{
      node: "Client ou não",
      type: "main",
      index: 0
    }]]
  };

  // 4. Update the Agent's prompt to use this new data
  const aiNode = workflow.nodes.find(n => n.name === 'André, Atendente' || n.name.includes('Andr'));
  if (aiNode) {
    // Update the prompt text to include the fetched status
    // The agent uses {{ $json.status }} in its prompt.
    // We need to make sure the data reaches the agent.
    // Since the agent is downstream, it will see the latest $json.
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('n8n_workflows.json updated: Added Buscar Agendamento node');
