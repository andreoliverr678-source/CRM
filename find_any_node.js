const fs = require('fs');
const filePath = process.argv[2];
const nodeName = process.argv[3];

let content = fs.readFileSync(filePath, 'utf16le');
if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
}
const wf = JSON.parse(content);
const node = wf.nodes.find(n => n.name === nodeName);
console.log(JSON.stringify(node, null, 2));
