
const fs = require('fs');
const https = require('https');

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTkzMGRkNy00ZDFkLTRjMmItODA1YS05NGU2NmNjYjZhNDYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZmRkMDY2NzgtMDMyYy00Y2E1LWEzYzYtZDUzM2IyYzI4ZGU1IiwiaWF0IjoxNzc4NTk1NTg1fQ.04wGAaBXpFoVYp1CZDK4HHx9ViVivsDMfjldkB2bQ5E';
const BASE = 'n8n.andreverissimo.shop';

async function fix() {
  const wf = JSON.parse(fs.readFileSync('workflow_fixed.json'));

  const filterNode = {
    "parameters": {
      "conditions": {
        "options": { "caseSensitive": true, "leftValue": "", "typeValidation": "strict", "version": 3 },
        "conditions": [
          {
            "id": "check-fromme",
            "leftValue": "={{ $json.fromMe }}",
            "rightValue": true,
            "operator": { "type": "boolean", "operation": "notEquals" }
          }
        ],
        "combinator": "and"
      }
    },
    "id": "filter-fromme-id",
    "name": "Ignorar Bot",
    "type": "n8n-nodes-base.if",
    "typeVersion": 2.3,
    "position": [7800, 7840]
  };

  if (!wf.nodes.find(n => n.name === 'Ignorar Bot')) {
    wf.nodes.push(filterNode);
    wf.connections['Dados'] = { "main": [[{ "node": "Ignorar Bot", "type": "main", "index": 0 }]] };
    wf.connections['Ignorar Bot'] = { "main": [[{ "node": "Analiz Client", "type": "main", "index": 0 }], []] };
    console.log('Filtro Ignorar Bot adicionado.');
  }

  function cleanForPut(w) {
    const out = { name: w.name, nodes: w.nodes, connections: w.connections, staticData: w.staticData || null };
    if (w.settings) {
      const allowed = ['executionOrder', 'timezone', 'saveManualExecutions', 'callerPolicy', 'errorWorkflow', 'executionTimeout', 'saveDataSuccessExecution', 'saveDataErrorExecution', 'saveExecutionProgress'];
      out.settings = {};
      allowed.forEach(k => { if (w.settings[k] !== undefined) out.settings[k] = w.settings[k]; });
    }
    return out;
  }

  const payload = cleanForPut(wf);
  
  const req = https.request({
    hostname: BASE, path: '/api/v1/workflows/1CUu2mqTMxbYCz9R', method: 'PUT',
    headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' }
  }, (res) => {
    let d = ''; res.on('data', chunk => d += chunk);
    res.on('end', () => {
      console.log('Update Status:', res.statusCode);
      if (res.statusCode === 200) {
        const act = https.request({ hostname: BASE, path: '/api/v1/workflows/1CUu2mqTMxbYCz9R/activate', method: 'POST', headers: { 'X-N8N-API-KEY': API_KEY } });
        act.end();
        console.log('Workflow atualizado e ativado com sucesso.');
      } else {
        console.error('Erro no update:', d);
      }
    });
  });
  req.write(JSON.stringify(payload));
  req.end();
}

fix();
