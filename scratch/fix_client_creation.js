const fs = require('fs');

const filePath = 'c:\\Users\\adasilva\\Downloads\\CRM\\n8n_workflows.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const barbearia = data.data.find(w => w.name === 'Barbearia');
if (barbearia) {
  // 1. Trim phone in Dados node
  const dadosNode = barbearia.nodes.find(n => n.name === 'Dados');
  if (dadosNode && dadosNode.parameters && dadosNode.parameters.assignments) {
    const telAssignment = dadosNode.parameters.assignments.assignments.find(a => a.name === 'telefone');
    if (telAssignment) {
      telAssignment.value = "={{ $json.body.data.key.remoteJid.split('@')[0].trim() }}";
    }
  }

  // 2. Set continueOnFail for Criar node
  const criarNode = barbearia.nodes.find(n => n.name === 'Criar');
  if (criarNode) {
    criarNode.continueOnFail = true;
    console.log('Set continueOnFail for Criar node.');
  }

  // 3. Set continueOnFail for Atualizar Cliente node (just in case)
  const atualizarNode = barbearia.nodes.find(n => n.name === 'Atualizar Cliente');
  if (atualizarNode) {
    atualizarNode.continueOnFail = true;
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('n8n_workflows.json updated to handle duplicate client creation errors.');
