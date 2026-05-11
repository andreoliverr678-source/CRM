const fs = require('fs');

const filePath = 'c:\\Users\\adasilva\\Downloads\\CRM\\n8n_workflows.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// 1. Find the "Barbearia" workflow
const workflow = data.data.find(w => w.name === 'Barbearia');
if (workflow) {
  // 2. Find the "Agendar" tool node
  const agendarNode = workflow.nodes.find(n => n.name === 'Agendar');
  if (agendarNode) {
    const statusField = agendarNode.parameters.fieldsUi.fieldValues.find(f => f.fieldId === 'status');
    if (statusField) {
      // Hardcode to "pendente" - remove the AI override
      statusField.fieldValue = 'pendente';
    }
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('n8n_workflows.json updated: Agendar tool now hardcoded to "pendente"');
