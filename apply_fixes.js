const fs = require('fs');
const https = require('https');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTkzMGRkNy00ZDFkLTRjMmItODA1YS05NGU2NmNjYjZhNDYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiMTliNDM0NTctMzcyMS00MmZiLWJmNGQtZjFlNWI5NjRhZjEzIiwiaWF0IjoxNzc4NjkwMzA2fQ.C_mF7KLPGWIgHJRk35HhP0RFDuP-k-b6_-wYwpEADOc";

const workflows = [
    { id: '1CUu2mqTMxbYCz9R', file: 'wf_barbearia.json', modifier: (wf) => {
        const node = wf.nodes.find(n => n.name === 'listaMensagens');
        if (node) {
            node.parameters.assignments.assignments[0].value = "={{ JSON.parse($('Switch1').item.json.message.last()).message }}";
            console.log('Modified listaMensagens in Main Workflow');
        }
    }},
    { id: 'ocGuVNYkRL96jrgq', file: 'wf_followup.json', modifier: (wf) => {
        const node = wf.nodes.find(n => n.name === 'Agendamentos - Lembrete 24h');
        if (node) {
            let filter = node.parameters.filterString;
            if (!filter.includes('criado_em')) {
                node.parameters.filterString += "&criado_em=lte.{{$now.minus(1, 'hour').toISO()}}";
                console.log('Modified Agendamentos - Lembrete 24h in Follow-up Workflow');
            }
        }
    }}
];

async function updateWorkflow(id, filePath, modifier) {
    let content = fs.readFileSync(filePath, 'utf16le');
    if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
    let wfRaw = JSON.parse(content);
    
    // Apply changes
    modifier(wfRaw);
    
    // Pick only strictly allowed updatable properties
    const wf = {
        name: wfRaw.name,
        nodes: wfRaw.nodes,
        connections: wfRaw.connections,
        settings: {
            timezone: wfRaw.settings.timezone || 'America/Sao_Paulo',
            executionOrder: wfRaw.settings.executionOrder || 'v1'
        }
    };
    
    const data = JSON.stringify(wf);
    
    const options = {
        hostname: 'n8n.andreverissimo.shop',
        path: `/api/v1/workflows/${id}`,
        method: 'PUT',
        headers: {
            'X-N8N-API-KEY': token,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let resData = '';
            res.on('data', (chunk) => resData += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`Workflow ${id} updated successfully!`);
                    resolve(JSON.parse(resData));
                } else {
                    console.log(`Failed to update ${id}: ${res.statusCode}`);
                    console.log(resData);
                    reject(resData);
                }
            });
        });
        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

async function run() {
    try {
        for (const wfObj of workflows) {
            await updateWorkflow(wfObj.id, `c:/Users/adasilva/Downloads/CRM/${wfObj.file}`, wfObj.modifier);
        }
    } catch (e) {
        console.error('Error during execution:', e);
    }
}

run();
