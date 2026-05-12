
const fs = require('fs');
const https = require('https');

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTkzMGRkNy00ZDFkLTRjMmItODA1YS05NGU2NmNjYjZhNDYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZmRkMDY2NzgtMDMyYy00Y2E1LWEzYzYtZDUzM2IyYzI4ZGU1IiwiaWF0IjoxNzc4NTk1NTg1fQ.04wGAaBXpFoVYp1CZDK4HHx9ViVivsDMfjldkB2bQ5E';
const BASE = 'n8n.andreverissimo.shop';

function apiRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: BASE, port: 443, path: `/api/v1${path}`, method,
      headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' },
      timeout: 30000,
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch(e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Strip read-only & disallowed properties before PUT
function cleanForPut(wf) {
  // Only allowed top-level keys
  const out = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    staticData: wf.staticData || null,
  };

  // Only allowed settings keys (n8n API schema)
  const allowedSettings = [
    'executionOrder', 'timezone', 'saveManualExecutions',
    'callerPolicy', 'errorWorkflow', 'executionTimeout',
    'saveDataSuccessExecution', 'saveDataErrorExecution', 'saveExecutionProgress',
  ];
  if (wf.settings) {
    out.settings = {};
    for (const k of allowedSettings) {
      if (wf.settings[k] !== undefined) out.settings[k] = wf.settings[k];
    }
  }

  return out;
}

async function main() {
  // ── BARBEARIA ─────────────────────────────────────────────
  console.log('--- BARBEARIA ---');
  const r1 = await apiRequest('GET', '/workflows/1CUu2mqTMxbYCz9R');
  if (r1.status !== 200) { console.error('GET failed:', r1.status); process.exit(1); }
  const wf1 = r1.body;
  console.log(`Got: "${wf1.name}" | nodes: ${wf1.nodes.length} | active: ${wf1.active}`);

  // FIX 1: Wait1 → 5-second timed wait
  const wait1 = wf1.nodes.find(n => n.name === 'Wait1');
  if (wait1) {
    wait1.parameters = { amount: 5, unit: 'seconds', resume: 'timeInterval' };
    console.log('✅ Wait1 → 5s timed wait');
  }

  // FIX 2: fromMe filter between Dados → Analiz Client
  if (!wf1.nodes.find(n => n.name === 'Ignorar fromMe')) {
    wf1.nodes.push({
      id: 'fromme-filter-001',
      name: 'Ignorar fromMe',
      type: 'n8n-nodes-base.if',
      typeVersion: 2.3,
      position: [7785, 7840],
      parameters: {
        conditions: {
          options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
          conditions: [{
            id: 'fromme-chk-01',
            leftValue: "={{ $('Dados').item.json.fromMe }}",
            rightValue: true,
            operator: { type: 'boolean', operation: 'notEquals' }
          }],
          combinator: 'and'
        },
        options: {}
      }
    });
    wf1.connections['Dados'] = { main: [[{ node: 'Ignorar fromMe', type: 'main', index: 0 }]] };
    wf1.connections['Ignorar fromMe'] = { main: [[{ node: 'Analiz Client', type: 'main', index: 0 }], []] };
    console.log('✅ Added fromMe filter: Dados → Ignorar fromMe → Analiz Client');
  }

  const payload1 = cleanForPut(wf1);
  fs.writeFileSync('./barbearia_FIXED_FINAL.json', JSON.stringify(payload1, null, 2));
  const u1 = await apiRequest('PUT', '/workflows/1CUu2mqTMxbYCz9R', payload1);
  console.log(u1.status === 200 ? '✅ Barbearia updated!' : `❌ PUT failed ${u1.status}: ${JSON.stringify(u1.body).slice(0,200)}`);

  // ── FOLLOW-UP ─────────────────────────────────────────────
  console.log('\n--- FOLLOW-UP ---');
  const r2 = await apiRequest('GET', '/workflows/ocGuVNYkRL96jrgq');
  if (r2.status !== 200) { console.error('GET failed:', r2.status); process.exit(1); }
  const wf2 = r2.body;
  console.log(`Got: "${wf2.name}" | nodes: ${wf2.nodes.length}`);

  // FIX 3: Ensure Marcar happens BEFORE Enviar in all 3 chains
  // 24h chain
  wf2.connections['Tem agendamentos 24h?'] = { main: [[{ node: 'Marcar 24h Enviado', type: 'main', index: 0 }], []] };
  wf2.connections['Marcar 24h Enviado']    = { main: [[{ node: 'Enviar Lembrete 24h', type: 'main', index: 0 }]] };
  wf2.connections['Enviar Lembrete 24h']   = { main: [[{ node: 'Registrar Followup 24h', type: 'main', index: 0 }]] };
  console.log('✅ 24h: Marcar → Enviar → Registrar');

  // 2h chain
  wf2.connections['Tem agendamentos 2h?'] = { main: [[{ node: 'Marcar 2h Enviado', type: 'main', index: 0 }], []] };
  wf2.connections['Marcar 2h Enviado']   = { main: [[{ node: 'Enviar Lembrete 2h', type: 'main', index: 0 }]] };
  wf2.connections['Enviar Lembrete 2h']  = { main: [[{ node: 'Registrar Followup 2h', type: 'main', index: 0 }]] };
  console.log('✅ 2h: Marcar → Enviar → Registrar');

  // Reativação chain
  wf2.connections['Tem clientes inativos?']      = { main: [[{ node: 'Marcar Reativação Enviada', type: 'main', index: 0 }], []] };
  wf2.connections['Marcar Reativação Enviada']   = { main: [[{ node: 'Enviar Convite Reativação', type: 'main', index: 0 }]] };
  wf2.connections['Enviar Convite Reativação']   = { main: [[{ node: 'Registrar Followup Reativação', type: 'main', index: 0 }]] };
  console.log('✅ Reativação: Marcar → Enviar → Registrar');

  const payload2 = cleanForPut(wf2);
  fs.writeFileSync('./followup_FIXED_FINAL.json', JSON.stringify(payload2, null, 2));
  const u2 = await apiRequest('PUT', '/workflows/ocGuVNYkRL96jrgq', payload2);
  console.log(u2.status === 200 ? '✅ Follow-up updated!' : `❌ PUT failed ${u2.status}: ${JSON.stringify(u2.body).slice(0,200)}`);

  // Activate follow-up
  const act = await apiRequest('POST', '/workflows/ocGuVNYkRL96jrgq/activate');
  console.log(`Follow-up activate: ${act.status === 200 ? '✅ Active' : '⚠️ status=' + act.status}`);

  console.log('\n🎉 Done!');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
