const fs = require('fs');
const https = require('https');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTkzMGRkNy00ZDFkLTRjMmItODA1YS05NGU2NmNjYjZhNDYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiMTliNDM0NTctMzcyMS00MmZiLWJmNGQtZjFlNWI5NjRhZjEzIiwiaWF0IjoxNzc4NjkwMzA2fQ.C_mF7KLPGWIgHJRk35HhP0RFDuP-k-b6_-wYwpEADOc";

async function updateWorkflow(id, filePath, modifier) {
    let content = fs.readFileSync(filePath, 'utf16le');
    if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
    let wfRaw = JSON.parse(content);
    
    modifier(wfRaw);
    
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

// MODIFIER: MAIN WORKFLOW
const fixMain = (wf) => {
    // 1. Remove Wait1
    wf.nodes = wf.nodes.filter(n => n.name !== 'Wait1');
    
    // 2. Remove connections to/from Wait1
    for (const nodeName in wf.connections) {
        for (const type in wf.connections[nodeName]) {
            wf.connections[nodeName][type] = wf.connections[nodeName][type].map(branch => {
                return branch.filter(target => target.node !== 'Wait1');
            });
        }
    }
    delete wf.connections['Wait1'];

    // 3. Add Retries and Error Handling to critical nodes
    const criticalNodes = ['Analiz Client', 'André, Atendente', 'Enviar texto', 'Salvar mensagem do cliente', 'Salvar resposta da ia'];
    wf.nodes.forEach(n => {
        if (criticalNodes.includes(n.name)) {
            n.onError = 'continue';
            n.retryOnFail = true;
            n.maxTries = 3;
            n.waitBetweenTries = 1000;
        }
    });

    console.log('Applied advanced fixes to Main Workflow');
};

// MODIFIER: FOLLOWUP WORKFLOW
const fixFollowup = (wf) => {
    // 1. Refine Reactivation Filter
    const reactNode = wf.nodes.find(n => n.name === 'Clientes Inativos 30d');
    if (reactNode) {
        reactNode.parameters.filterString += "&ultimo_contato=lte.{{$now.setZone('America/Sao_Paulo').minus(15,'days').toISO()}}";
    }

    // 2. Add Retries to messaging nodes
    const msgNodes = ['Enviar Lembrete 24h', 'Enviar Lembrete 2h', 'Enviar Convite Reativação'];
    wf.nodes.forEach(n => {
        if (msgNodes.includes(n.name)) {
            n.retryOnFail = true;
            n.maxTries = 2;
            n.waitBetweenTries = 2000;
        }
    });

    console.log('Applied advanced fixes to Followup Workflow');
};

async function run() {
    try {
        await updateWorkflow('1CUu2mqTMxbYCz9R', 'c:/Users/adasilva/Downloads/CRM/wf_barbearia.json', fixMain);
        await updateWorkflow('ocGuVNYkRL96jrgq', 'c:/Users/adasilva/Downloads/CRM/wf_followup.json', fixFollowup);
    } catch (e) {
        console.error(e);
    }
}

run();
