const https = require('https');
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTkzMGRkNy00ZDFkLTRjMmItODA1YS05NGU2NmNjYjZhNDYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNjc2ZGVhOWUtZjQ2NC00NTY0LWFmNzItZTY5ODIwZTdlOThmIiwiaWF0IjoxNzc4MjUzODQ2LCJleHAiOjE3ODA4MDQ4MDB9.Upnc2tA8hfvhKdzKrllCbVyr7hAPs5nOmTOVkMa9_OU";
const WF_ID = "1CUu2mqTMxbYCz9R";

// Nodes para remover (órfãos e sticky notes)
const REMOVE = [
  'Delete table or rows', 'Agendamentos', 'Memoria', 'Agendar', 'Atualiza',
  'criar_servico', 'servicos', 'OpenAI Chat Model', 'Think',
  'Sticky Note', 'Sticky Note1', 'Sticky Note2', 'Sticky Note3',
  'Sticky Note4', 'Sticky Note5', 'Sticky Note6'
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
  const before = wf.nodes.length;
  console.log('Nodes antes:', before);

  // Remover nodes órfãos e sticky notes
  wf.nodes = wf.nodes.filter(n => !REMOVE.includes(n.name));
  const removed = before - wf.nodes.length;
  console.log('Removidos:', removed, 'nodes');
  console.log('Nodes depois:', wf.nodes.length);

  // Remover conexões dos nodes deletados
  REMOVE.forEach(name => delete wf.connections[name]);

  // Listar nodes que sobraram
  console.log('\nNodes restantes:');
  wf.nodes.forEach(n => console.log(' -', n.name, '|', n.type.split('.').pop()));

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
    console.log('\n✅ Workflow limpo! Nodes final:', u.nodes.length);
  } else {
    console.log('❌ Erro', putR.s, putR.b.substring(0, 300));
  }
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
