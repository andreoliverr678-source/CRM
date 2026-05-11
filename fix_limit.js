const https = require('https');
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTkzMGRkNy00ZDFkLTRjMmItODA1YS05NGU2NmNjYjZhNDYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNjc2ZGVhOWUtZjQ2NC00NTY0LWFmNzItZTY5ODIwZTdlOThmIiwiaWF0IjoxNzc4MjUzODQ2LCJleHAiOjE3ODA4MDQ4MDB9.Upnc2tA8hfvhKdzKrllCbVyr7hAPs5nOmTOVkMa9_OU";
const WF_ID = "1CUu2mqTMxbYCz9R";

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : undefined;
    const opts = {
      hostname: 'n8n.andreverissimo.shop', port: 443, path, method,
      headers: { 'X-N8N-API-KEY': TOKEN, 'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}) }
    };
    const r = https.request(opts, res => {
      let b = ''; res.on('data', d => b += d);
      res.on('end', () => resolve({ status: res.statusCode, body: b }));
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

async function main() {
  console.log('Buscando workflow...');
  const r = await req('GET', `/api/v1/workflows/${WF_ID}`);
  const wf = JSON.parse(r.body);
  console.log(`Nodes: ${wf.nodes.length}`);

  const nodeLimit = {
    id: 'limit-to-one-item-001',
    name: 'Apenas 1 item',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [8388, 7760],
    parameters: {
      jsCode: 'return [$input.first()];'
    }
  };

  if (!wf.nodes.find(n => n.name === 'Apenas 1 item')) {
    wf.nodes.push(nodeLimit);
    console.log('✅ Node Apenas 1 item adicionado');
    
    // Apaga -> Apenas 1 item
    wf.connections['Apaga'] = { main: [[{ node: 'Apenas 1 item', type: 'main', index: 0 }]] };
    
    // Apenas 1 item -> Atualizar Cliente
    wf.connections['Apenas 1 item'] = { main: [[{ node: 'Atualizar Cliente', type: 'main', index: 0 }]] };
  } else {
    console.log('ℹ️ Node Apenas 1 item já existe. Atualizando conexões por garantia.');
    wf.connections['Apaga'] = { main: [[{ node: 'Apenas 1 item', type: 'main', index: 0 }]] };
    wf.connections['Apenas 1 item'] = { main: [[{ node: 'Atualizar Cliente', type: 'main', index: 0 }]] };
  }

  const payload = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: {
      executionOrder: wf.settings?.executionOrder || 'v1',
      callerPolicy: wf.settings?.callerPolicy || 'workflowsFromSameOwner',
      ...(wf.settings?.timezone ? { timezone: wf.settings.timezone } : {})
    },
    staticData: wf.staticData || null
  };

  console.log('\nEnviando PUT...');
  const putR = await req('PUT', `/api/v1/workflows/${WF_ID}`, payload);
  if (putR.status === 200) {
    const updated = JSON.parse(putR.body);
    console.log(`✅ Workflow atualizado! Nodes: ${updated.nodes.length}`);
  } else {
    console.log(`❌ Erro ${putR.status}:`, putR.body.substring(0, 300));
  }
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
