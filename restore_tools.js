const https = require('https');
const fs = require('fs');
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTkzMGRkNy00ZDFkLTRjMmItODA1YS05NGU2NmNjYjZhNDYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNjc2ZGVhOWUtZjQ2NC00NTY0LWFmNzItZTY5ODIwZTdlOThmIiwiaWF0IjoxNzc4MjUzODQ2LCJleHAiOjE3ODA4MDQ4MDB9.Upnc2tA8hfvhKdzKrllCbVyr7hAPs5nOmTOVkMa9_OU";
const WF_ID = "1CUu2mqTMxbYCz9R";

// Nodes a restaurar (ferramentas do agente de IA)
const RESTORE_NAMES = ['Agendamentos', 'Memoria', 'Agendar', 'Atualiza', 'criar_servico', 'servicos', 'OpenAI Chat Model', 'Think'];

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
  // Carregar backup com os nodes originais
  const backup = JSON.parse(fs.readFileSync('barbearia_node_fixed.json', 'utf8'));

  // Buscar workflow atual
  const r = await api('GET', '/api/v1/workflows/' + WF_ID);
  const wf = JSON.parse(r.b);
  console.log('Nodes atuais:', wf.nodes.length);

  // Extrair nodes a restaurar do backup
  const toRestore = backup.nodes.filter(n => RESTORE_NAMES.includes(n.name));
  console.log('Nodes para restaurar:', toRestore.map(n => n.name).join(', '));

  // Adicionar apenas os que não existem ainda
  let added = 0;
  toRestore.forEach(node => {
    if (!wf.nodes.find(n => n.id === node.id || n.name === node.name)) {
      wf.nodes.push(node);
      added++;
      console.log(' + Restaurado:', node.name);
    } else {
      console.log(' = Já existe:', node.name);
    }
  });

  // Restaurar conexões de cada node (ai_tool, ai_languageModel, ai_memory)
  RESTORE_NAMES.forEach(name => {
    if (backup.connections[name]) {
      wf.connections[name] = backup.connections[name];
      console.log(' > Conexão restaurada:', name, '->', JSON.stringify(backup.connections[name]).substring(0, 80));
    }
  });

  // Restaurar conexão do André Atendente para incluir todas as ferramentas
  if (backup.connections['André, Atendente']) {
    wf.connections['André, Atendente'] = backup.connections['André, Atendente'];
    console.log(' > Conexão André, Atendente restaurada');
  }

  console.log('\nNodes após restauração:', wf.nodes.length);

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
    console.log('\n✅ Workflow restaurado! Nodes final:', u.nodes.length);
    // Verificar que os nodes estão lá
    const check = ['Agendamentos', 'Agendar', 'Atualiza', 'criar_servico', 'servicos', 'OpenAI Chat Model', 'Think', 'Memoria'];
    check.forEach(name => {
      const found = u.nodes.find(n => n.name === name);
      console.log((found ? '✅' : '❌'), name);
    });
  } else {
    console.log('❌ Erro', putR.s, putR.b.substring(0, 400));
  }
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
