const fs = require('fs');

const filePath = 'c:\\Users\\adasilva\\Downloads\\CRM\\n8n_workflows.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const barbearia = data.data.find(w => w.name === 'Barbearia');
if (barbearia) {
  // 1. Fix André, Atendente node (Remove duplicates and set clean prompt)
  const agentNode = barbearia.nodes.find(n => n.name === 'André, Atendente');
  if (agentNode) {
    // Clear existing parameters to remove duplicates
    const params = agentNode.parameters;
    delete params.systemMessage; 
    
    // Set a clean system message
    params.systemMessage = `
# André, Atendente - Barbearia Alfa

## REGRAS DE OURO
- Brasileirão, fala "fala irmão", "bora", "fechou".
- Máximo 2 linhas por resposta.
- Use as ferramentas disponíveis para ajudar o cliente.

## TOOLS
- servicos: Ver lista de serviços e preços.
- Agendar: Criar o agendamento (NÃO peça confirmação agora, apenas agende).
- criar_servico: Adicionar novo serviço se não existir na lista.
- confirmar_agendamento: Confirmar um agendamento pendente.

## CONTEXTO
Nome: {{ $json.nome || 'cliente' }}
Telefone: {{ $json.telefone }}
`;
  }

  // 2. Fix Agendar Tool (Ensure toolDescription and proper mapping)
  const agendarNode = barbearia.nodes.find(n => n.name === 'Agendar');
  if (agendarNode && agendarNode.parameters) {
    agendarNode.parameters.toolDescription = 'Cria um agendamento para o cliente. Campos: nome, telefone, servico, data, hora.';
    // Ensure indices and labels are clean
    // n8n supabaseTool v1 usually wants fieldValues with AI override
  }

  // 3. Fix servicos Tool (Ensure toolDescription)
  const servicosNode = barbearia.nodes.find(n => n.name === 'servicos');
  if (servicosNode && servicosNode.parameters) {
    servicosNode.parameters.toolDescription = 'Retorna a lista de serviços e preços da barbearia.';
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('n8n_workflows.json cleaned and tool descriptions added.');
