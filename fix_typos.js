
const fs = require('fs');
const wf = JSON.parse(fs.readFileSync('workflow_fixed.json'));

const nodesToFix = ['Message', 'Audio1', 'image', 'Video1'];

nodesToFix.forEach(nodeName => {
    const node = wf.nodes.find(n => n.name === nodeName);
    if (node && node.parameters && node.parameters.assignments) {
        const assignments = node.parameters.assignments.assignments;
        assignments.forEach(as => {
            if (as.name === 'Timestemp') {
                as.name = 'Timestamp'; // Fix typo
            }
        });
        
        // Ensure 'id' and 'Timestamp' exist
        if (!assignments.find(a => a.name === 'id')) {
            assignments.push({ id: 'id-gen-' + nodeName, name: 'id', value: "={{ $('Dados').item.json.id }}", type: 'string' });
        }
        if (!assignments.find(a => a.name === 'Timestamp')) {
            assignments.push({ id: 'ts-gen-' + nodeName, name: 'Timestamp', value: "={{ $('Dados').item.json.Timestamp }}", type: 'number' });
        }
    }
});

// Update Switch1 to use the fixed names
const switch1 = wf.nodes.find(n => n.name === 'Switch1');
if (switch1) {
    // Rule 1: Kill old executions
    switch1.parameters.rules.values[0].conditions.conditions[0].leftValue = "={{ JSON.parse($json.message[$json.message.length - 1]).id }}";
    
    // Rule 2: Check silence (10 seconds)
    // We expect Timestamp to be a number (ms or s) or ISO string. Let's make it robust.
    switch1.parameters.rules.values[1].conditions.conditions[0].leftValue = "={{ new Date(JSON.parse($json.message[$json.message.length - 1]).Timestamp) }}";
}

fs.writeFileSync('workflow_fixed.json', JSON.stringify(wf));
console.log('Typo "Timestemp" corrected to "Timestamp" in all nodes.');
