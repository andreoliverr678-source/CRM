const https = require('https');
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTkzMGRkNy00ZDFkLTRjMmItODA1YS05NGU2NmNjYjZhNDYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNjc2ZGVhOWUtZjQ2NC00NTY0LWFmNzItZTY5ODIwZTdlOThmIiwiaWF0IjoxNzc4MjUzODQ2LCJleHAiOjE3ODA4MDQ4MDB9.Upnc2tA8hfvhKdzKrllCbVyr7hAPs5nOmTOVkMa9_OU";
const WF_ID = "1CUu2mqTMxbYCz9R";

function api(method, path, body) {
  return new Promise((r, e) => {
    const d = body ? JSON.stringify(body) : undefined;
    const req = https.request({
      hostname: 'n8n.andreverissimo.shop', port: 443, path, method,
      headers: { 'X-N8N-API-KEY': TOKEN, 'Content-Type': 'application/json', ...(d ? { 'Content-Length': Buffer.byteLength(d) } : {}) }
    }, res => { let b = ''; res.on('data', x => b += x); res.on('end', () => r({ s: res.statusCode, b })); });
    req.on('error', e); if (d) req.write(d); req.end();
  });
}

async function main() {
  const r = await api('GET', '/api/v1/workflows/' + WF_ID);
  const wf = JSON.parse(r.b);
  console.log('Nodes:', wf.nodes.length);

  // 1. Remover 'Apenas 1 item' (quebra o fluxo de dados)
  const before = wf.nodes.length;
  wf.nodes = wf.nodes.filter(n => n.name !== 'Apenas 1 item');
  console.log('Removidos:', before - wf.nodes.length, 'node(s)');

  // 2. Adicionar node que reseta dados para os originais do Dados
  const codeStr = "const dados = $('Dados').first().json; return [{ json: dados }];";

  const nodeReset = {
    id: 'reset-dados-001',
    name: 'Resetar para dados originais',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [8388, 7760],
    parameters: { jsCode: codeStr }
  };

  if (!wf.nodes.find(n => n.name === 'Resetar para dados originais')) {
    wf.nodes.push(nodeReset);
    console.log('Node Resetar adicionado');
  }

  // 3. Atualizar conexoes: Apaga -> Resetar -> Atualizar Cliente
  wf.connections['Apaga'] = { main: [[{ node: 'Resetar para dados originais', type: 'main', index: 0 }]] };
  wf.connections['Resetar para dados originais'] = { main: [[{ node: 'Atualizar Cliente', type: 'main', index: 0 }]] };
  delete wf.connections['Apenas 1 item'];

  const settings = {
    executionOrder: wf.settings?.executionOrder || 'v1',
    callerPolicy: wf.settings?.callerPolicy || 'workflowsFromSameOwner',
    ...(wf.settings?.timezone ? { timezone: wf.settings.timezone } : {})
  };

  const putR = await api('PUT', '/api/v1/workflows/' + WF_ID, { name: wf.name, nodes: wf.nodes, connections: wf.connections, settings, staticData: wf.staticData || null });
  if (putR.s === 200) {
    const u = JSON.parse(putR.b);
    console.log('Atualizado! Nodes:', u.nodes.length);
    console.log('Conn Apaga:', JSON.stringify(u.connections['Apaga']));
    console.log('Conn Resetar:', JSON.stringify(u.connections['Resetar para dados originais']));
  } else {
    console.log('ERRO', putR.s, putR.b.substring(0, 300));
  }
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
