const fs = require('fs');

const filePath = 'c:\\Users\\adasilva\\Downloads\\CRM\\n8n_workflows.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const barbearia = data.data.find(w => w.name === 'Barbearia');
if (barbearia) {
  // 1. Redirect Criar connection to Regra
  if (barbearia.connections['Criar']) {
    barbearia.connections['Criar'].main = [
      [
        {
          "node": "Regra",
          "type": "main",
          "index": 0
        }
      ]
    ];
    console.log('Redirected Criar -> Regra.');
  }

  // 2. Ensure Atualizar Cliente also goes to Regra (already verified, but good to be sure)
  if (barbearia.connections['Atualizar Cliente']) {
     barbearia.connections['Atualizar Cliente'].main = [
      [
        {
          "node": "Regra",
          "type": "main",
          "index": 0
        }
      ]
    ];
  }

  // 3. Clean up the loop: delete Wait node connections from the connections object
  delete barbearia.connections['Wait'];
  
  // 4. Also check if "Dados" node is correctly providing variables
  const dadosNode = barbearia.nodes.find(n => n.name === 'Dados');
  if (dadosNode && dadosNode.parameters && dadosNode.parameters.assignments) {
      // Ensure telefone is trimmed
      const assignments = dadosNode.parameters.assignments.assignments;
      const tel = assignments.find(a => a.name === 'telefone');
      if (tel) {
          tel.value = "={{ $json.body.data.key.remoteJid.split('@')[0].trim() }}";
      }
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('Loop broken and workflow optimized.');
