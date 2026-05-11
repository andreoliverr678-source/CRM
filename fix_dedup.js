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

  // Nodes novos para deduplicação por ID da mensagem
  const nodeDedup = {
    id: "dedup-msg-id-check-001",
    name: "ID ja processado?",
    type: "n8n-nodes-base.redis",
    typeVersion: 1,
    position: [7884, 7840],
    parameters: {
      operation: "get",
      propertyName: "processed",
      key: "={{ $json.id }}_processed"
    },
    credentials: { redis: { id: "mXcfCUa9m34XLSEx", name: "Redis account" } }
  };

  const nodeIfDedup = {
    id: "dedup-if-check-001",
    name: "Ja processou?",
    type: "n8n-nodes-base.if",
    typeVersion: 2.3,
    position: [8000, 7840],
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: "", typeValidation: "loose", version: 3 },
        combinator: "and",
        conditions: [{
          id: "dedup-cond-001",
          leftValue: "={{ $json.processed }}",
          rightValue: "",
          operator: { type: "string", operation: "exists", singleValue: true }
        }]
      },
      options: {}
    }
  };

  const nodeMarkProcessed = {
    id: "dedup-mark-processed-001",
    name: "Marcar ID processado",
    type: "n8n-nodes-base.redis",
    typeVersion: 1,
    position: [8116, 7920],
    parameters: {
      operation: "set",
      key: "={{ $('Dados').item.json.id }}_processed",
      value: "1",
      expire: true,
      ttl: 120
    },
    credentials: { redis: { id: "mXcfCUa9m34XLSEx", name: "Redis account" } }
  };

  // Verificar se já foram adicionados
  if (wf.nodes.find(n => n.name === "ID ja processado?")) {
    console.log("⚠️ Nodes de dedup já existem, pulando adição");
  } else {
    wf.nodes.push(nodeDedup, nodeIfDedup, nodeMarkProcessed);
    console.log("✅ 3 nodes de dedup adicionados");
  }

  // Atualizar conexões
  // E de mim? (false, index 1) → ID ja processado? (era → Analiz Client)
  const fromMeConn = wf.connections["E de mim?"];
  if (fromMeConn) {
    wf.connections["E de mim?"] = {
      main: [
        [],  // true (fromMe) → para
        [{ node: "ID ja processado?", type: "main", index: 0 }]  // false → dedup check
      ]
    };
  } else {
    // Fallback: Dados → ID ja processado?
    wf.connections["Dados"] = { main: [[{ node: "ID ja processado?", type: "main", index: 0 }]] };
  }

  // ID ja processado? → Ja processou?
  wf.connections["ID ja processado?"] = {
    main: [[{ node: "Ja processou?", type: "main", index: 0 }]]
  };

  // Ja processou?
  //   true (já processou) → PARA (sem conexão = para)
  //   false (novo) → Marcar ID processado
  wf.connections["Ja processou?"] = {
    main: [
      [],  // true → para (mensagem duplicada)
      [{ node: "Marcar ID processado", type: "main", index: 0 }]  // false → continua
    ]
  };

  // Marcar ID processado → Analiz Client
  wf.connections["Marcar ID processado"] = {
    main: [[{ node: "Analiz Client", type: "main", index: 0 }]]
  };

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
    // Verificar conexão final
    console.log("Conn E de mim?:", JSON.stringify(updated.connections["E de mim?"]));
    console.log("Conn Ja processou?:", JSON.stringify(updated.connections["Ja processou?"]));
    console.log("Conn Marcar ID processado:", JSON.stringify(updated.connections["Marcar ID processado"]));
  } else {
    console.log(`❌ Erro ${putR.status}:`, putR.body.substring(0, 300));
  }
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
