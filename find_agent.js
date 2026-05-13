const fs = require('fs');
let content = fs.readFileSync('c:/Users/adasilva/Downloads/CRM/check_main.json', 'utf16le');
if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
const wf = JSON.parse(content);
const node = wf.nodes.find(n => n.name.startsWith('Andr') && n.name.includes('Atendente'));
console.log(JSON.stringify(node, null, 2));
