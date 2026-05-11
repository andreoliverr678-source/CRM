const https = require('https');
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTkzMGRkNy00ZDFkLTRjMmItODA1YS05NGU2NmNjYjZhNDYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNjc2ZGVhOWUtZjQ2NC00NTY0LWFmNzItZTY5ODIwZTdlOThmIiwiaWF0IjoxNzc4MjUzODQ2LCJleHAiOjE3ODA4MDQ4MDB9.Upnc2tA8hfvhKdzKrllCbVyr7hAPs5nOmTOVkMa9_OU";
const WF_ID = "1CUu2mqTMxbYCz9R";

// Nodes extras que adicionamos e precisam ser removidos
const NODES_TO_REMOVE = [
  'E de mim?',
  'ID ja processado?',
  'Ja processou?',
  'Marcar ID processado',
  'Resetar para dados originais',
  'Apenas 1 item'
];

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
  console.log('Nodes antes:', wf.nodes.length);

  // 1. Remover todos os nodes extras
  wf.nodes = wf.nodes.filter(n => !NODES_TO_REMOVE.includes(n.name));
  console.log('Nodes depois da remocao:', wf.nodes.length);

  // 2. Restaurar conexoes originais
  // Dados → Analiz Client (direto, sem dedup)
  wf.connections['Dados'] = { main: [[{ node: 'Analiz Client', type: 'main', index: 0 }]] };

  // Apaga → Atualizar Cliente (direto, sem reset node)
  wf.connections['Apaga'] = { main: [[{ node: 'Atualizar Cliente', type: 'main', index: 0 }]] };

  // Remover conexoes dos nodes removidos
  NODES_TO_REMOVE.forEach(name => delete wf.connections[name]);

  console.log('Conexoes restauradas');
  console.log('Conn Dados:', JSON.stringify(wf.connections['Dados']));
  console.log('Conn Apaga:', JSON.stringify(wf.connections['Apaga']));

  const settings = {
    executionOrder: wf.settings?.executionOrder || 'v1',
    callerPolicy: wf.settings?.callerPolicy || 'workflowsFromSameOwner',
    ...(wf.settings?.timezone ? { timezone: wf.settings.timezone } : {})
  };

  const putR = await api('PUT', '/api/v1/workflows/' + WF_ID, {
    name: wf.name, nodes: wf.nodes, connections: wf.connections,
    settings, staticData: wf.staticData || null
  });

  if (putR.s === 200) {
    const u = JSON.parse(putR.b);
    console.log('\n✅ Workflow revertido! Nodes final:', u.nodes.length);
  } else {
    console.log('❌ Erro', putR.s, putR.b.substring(0, 300));
  }
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
