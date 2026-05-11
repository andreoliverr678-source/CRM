const fs = require('fs');

const filePath = 'c:\\Users\\adasilva\\Downloads\\CRM\\n8n_workflows.json';
let content = fs.readFileSync(filePath, 'utf8');

// Fix the likely typo gpt-4.1-mini -> gpt-4o-mini
content = content.replace(/gpt-4\.1-mini/g, 'gpt-4o-mini');

fs.writeFileSync(filePath, content);
console.log('Fixed GPT model name typo.');
