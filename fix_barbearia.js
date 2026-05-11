const https = require('https');
const fs = require('fs');

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTkzMGRkNy00ZDFkLTRjMmItODA1YS05NGU2NmNjYjZhNDYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNjc2ZGVhOWUtZjQ2NC00NTY0LWFmNzItZTY5ODIwZTdlOThmIiwiaWF0IjoxNzc4MjUzODQ2LCJleHAiOjE3ODA4MDQ4MDB9.Upnc2tA8hfvhKdzKrllCbVyr7hAPs5nOmTOVkMa9_OU";
const WF_ID = "1CUu2mqTMxbYCz9R";
const HOST = "n8n.andreverissimo.shop";

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : undefined;
    const options = {
      hostname: HOST, port: 443, path, method,
      headers: {
        'X-N8N-API-KEY': TOKEN,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };
    const req = https.request(options, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  // 1. Buscar workflow atual
  console.log('Buscando workflow...');
  const r = await request('GET', `/api/v1/workflows/${WF_ID}`);
  const wf = JSON.parse(r.body);
  console.log(`Nome: ${wf.name}, Nodes: ${wf.nodes.length}`);

  // 2. Fix: Adicionar early fromMe check (novo node IF entre Dados e Analiz Client)
  const fromMeNode = {
    id: "fromme-early-exit-001",
    name: "E de mim?",
    type: "n8n-nodes-base.if",
    typeVersion: 2.3,
    position: [7784, 7840],
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 3 },
        combinator: "and",
        conditions: [{
          id: "fromme-check-001",
          leftValue: "={{ $json.fromMe }}",
          rightValue: true,
          operator: { type: "boolean", operation: "equals" }
        }]
      },
      options: {}
    }
  };

  // 3. Fix: Criar chave - adicionar value="1" e TTL=3600
  const criIndex = wf.nodes.findIndex(n => n.id === "7e4391e5-74f2-43b2-86d2-90a81f253522");
  if (criIndex >= 0) {
    wf.nodes[criIndex].parameters = {
      operation: "set",
      key: "={{ $('Dados').item.json.instance }} {{ $('Dados').item.json.telefone }} block",
      value: "1",
      expire: true,
      ttl: 3600
    };
    console.log('✅ Fix Criar chave aplicado');
  } else {
    console.log('⚠️ Node Criar chave não encontrado pelo ID, buscando por nome...');
    const ci2 = wf.nodes.findIndex(n => n.name === "Criar chave");
    if (ci2 >= 0) {
      wf.nodes[ci2].parameters = {
        operation: "set",
        key: "={{ $('Dados').item.json.instance }} {{ $('Dados').item.json.telefone }} block",
        value: "1",
        expire: true,
        ttl: 3600
      };
      console.log('✅ Fix Criar chave aplicado (por nome)');
    }
  }

  // 4. Adicionar o novo node fromMe ao array
  // Verificar se já existe
  const alreadyHas = wf.nodes.find(n => n.name === "E de mim?");
  if (!alreadyHas) {
    wf.nodes.push(fromMeNode);
    console.log('✅ Node "E de mim?" adicionado');

    // 5. Atualizar conexões: Dados → "E de mim?" → Analiz Client
    //    Antes: Dados → Analiz Client
    wf.connections["Dados"] = { main: [[{ node: "E de mim?", type: "main", index: 0 }]] };
    //    E de mim? falso (fromMe=false) → Analiz Client
    wf.connections["E de mim?"] = {
      main: [
        [], // true (fromMe=true) → parar (sem conexão)
        [{ node: "Analiz Client", type: "main", index: 0 }] // false → continua
      ]
    };
    console.log('✅ Conexões atualizadas');
  } else {
    console.log('ℹ️ Node "E de mim?" já existe, pulando');
  }

  // 6. Salvar o JSON corrigido
  // Manter apenas campos aceitos pelo PUT do n8n
  const settings = {
    executionOrder: wf.settings?.executionOrder || 'v1',
    callerPolicy: wf.settings?.callerPolicy || 'workflowsFromSameOwner',
    ...(wf.settings?.timezone ? { timezone: wf.settings.timezone } : {})
  };

  const payload = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings,
    staticData: wf.staticData || null
  };

  fs.writeFileSync('barbearia_node_fixed.json', JSON.stringify(payload, null, 2));
  console.log('Payload salvo em barbearia_node_fixed.json');

  // 7. Enviar PUT
  console.log('\nEnviando PUT...');
  const putR = await request('PUT', `/api/v1/workflows/${WF_ID}`, payload);
  console.log(`Status: ${putR.status}`);
  if (putR.status === 200) {
    console.log('✅ Workflow atualizado com sucesso!');
    const updated = JSON.parse(putR.body);
    console.log(`Nodes no servidor: ${updated.nodes.length}`);
  } else {
    console.log('❌ Erro:', putR.body.substring(0, 300));
  }
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
