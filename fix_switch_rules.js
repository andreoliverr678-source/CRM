
const fs = require('fs');
const wf = JSON.parse(fs.readFileSync('workflow_fixed.json'));

const switch1 = wf.nodes.find(n => n.name === 'Switch1');

// Improved rules for Switch1
switch1.parameters.rules.values = [
  {
    "conditions": {
      "options": { "caseSensitive": true, "leftValue": "", "typeValidation": "strict", "version": 2 },
      "conditions": [
        {
          "leftValue": "={{ JSON.parse($json.message[$json.message.length - 1]).id }}",
          "rightValue": "={{ $('Dados').item.json.id }}",
          "operator": { "type": "string", "operation": "notEquals" },
          "id": "kill-old-execution"
        }
      ],
      "combinator": "and"
    },
    "renameOutput": true,
    "outputKey": "Nada a fazer"
  },
  {
    "conditions": {
      "options": { "caseSensitive": true, "leftValue": "", "typeValidation": "strict", "version": 2 },
      "conditions": [
        {
          "id": "check-silence",
          "leftValue": "={{ new Date(JSON.parse($json.message[$json.message.length - 1]).Timestamp) }}",
          "rightValue": "={{ $now.minus(10, 'seconds') }}",
          "operator": { "type": "dateTime", "operation": "before" }
        }
      ],
      "combinator": "and"
    },
    "renameOutput": true,
    "outputKey": "Prosseguir"
  }
];

fs.writeFileSync('workflow_fixed.json', JSON.stringify(wf));
console.log('Switch1 rules updated in workflow_fixed.json');
