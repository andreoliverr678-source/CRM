const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ override: true });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

// Validação explícita das variáveis de ambiente
if (!supabaseUrl) {
  console.error('[ERROR] SUPABASE_URL não está definida. Verifique o arquivo .env do backend.');
  process.exit(1);
}

if (!supabaseKey) {
  console.error('[ERROR] SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_ANON_KEY) não está definida. Verifique o arquivo .env do backend.');
  process.exit(1);
}

// Valida formato mínimo de JWT (3 partes separadas por ponto)
if (supabaseKey.split('.').length !== 3) {
  console.error('[ERROR] A chave do Supabase parece estar malformada (não é um JWT válido). Verifique SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

// Log qual chave está sendo usada (sem expor o valor)
const keyType = process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : 'anon';
console.log(`🔌 Supabase conectando: ${supabaseUrl} [chave: ${keyType}]`);

// Opções adequadas para uso server-side com service_role
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

module.exports = supabase;
