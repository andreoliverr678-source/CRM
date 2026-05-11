const fs = require('fs');

const filePath = 'c:\\Users\\adasilva\\Downloads\\CRM\\n8n_workflows.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const barbearia = data.data.find(w => w.name === 'Barbearia');
if (barbearia) {
  // 1. Revert Agendar tool to NOT have status field (let the DB trigger handle it)
  const agendarNode = barbearia.nodes.find(n => n.name === 'Agendar');
  if (agendarNode && agendarNode.parameters && agendarNode.parameters.fieldsUi) {
    agendarNode.parameters.fieldsUi.fieldValues = agendarNode.parameters.fieldsUi.fieldValues.filter(f => f.fieldId !== 'status');
    console.log('Removed status field from Agendar tool.');
  }

  // 2. Cleanup Prompt to be simpler but still mention pendente
  const agentNode = barbearia.nodes.find(n => n.name === 'André, Atendente');
  if (agentNode && agentNode.parameters) {
    agentNode.parameters.systemMessage = `
# André, Atendente - Barbearia Alfa

## REGRAS DE OURO
- Brasileirão, fala "fala irmão", "bora", "fechou".
- Curto e grosso: máximo 2 linhas.
- NUNCA repita perguntas. Se o cliente já disse algo, use.
- Todo novo agendamento é criado como "pendente". Não fale de confirmação agora, apenas agende.

## FLUXO DE AGENDAMENTO
1. Pergunte o nome (se não souber).
2. Mostre serviços (use tool "servicos") e preços.
3. Peça data e hora.
4. Quando tiver tudo (nome, serviço, data, hora), chame "Agendar".

## TOOLS
- servicos: Listar serviços e preços.
- criar_servico: Se o cliente quiser algo novo.
- Agendar: Criar o agendamento. (NÃO precisa passar status, o sistema cuida disso).
- confirmar_agendamento: APENAS se o cliente estiver respondendo a um lembrete.

## CONTEXTO ATUAL
Nome: {{ $json.nome || 'cliente' }}
Telefone: {{ $json.telefone }}
Mensagem: {{ $json.mensagem }}
`;
    console.log('Simplified AI Agent prompt.');
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('n8n_workflows.json updated: Tools reverted and prompt cleaned.');
