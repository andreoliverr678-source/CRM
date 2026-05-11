const fs = require('fs');

const filePath = 'c:\\Users\\adasilva\\Downloads\\CRM\\n8n_workflows.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const barbearia = data.data.find(w => w.name === 'Barbearia');
if (barbearia) {
  const agendarNode = barbearia.nodes.find(n => n.name === 'Agendar');
  if (agendarNode && agendarNode.parameters) {
    agendarNode.parameters.operation = 'insert'; // Explicitly set insert
    agendarNode.parameters.toolDescription = 'Use esta ferramenta para criar um novo agendamento no banco de dados quando você tiver o Nome, Serviço, Data e Hora.';
    console.log('Set Agendar operation to insert and added description.');
  }

  const agentNode = barbearia.nodes.find(n => n.name === 'André, Atendente');
  if (agentNode) {
    // Make the prompt even more aggressive about calling the tool
    agentNode.parameters.systemMessage = `
# André, Atendente - Barbearia Alfa

## REGRAS DE OURO
- Brasileirão, fala "fala irmão", "bora", "fechou".
- Máximo 2 linhas por resposta.
- Se o cliente informou Nome, Serviço, Data e Hora, chame IMEDIATAMENTE a ferramenta "Agendar".

## FORMATAÇÃO DE DADOS (OBRIGATÓRIO)
Ao chamar "Agendar":
- data: Converta para YYYY-MM-DD. Hoje é {{ $now.setZone('America/Sao_Paulo').format('yyyy-MM-dd') }}. Amanhã é {{ $now.plus({days: 1}).setZone('America/Sao_Paulo').format('yyyy-MM-dd') }}.
- hora: Converta para HH:mm (Ex: 15:00).

## TOOLS
- servicos: Listar serviços e preços.
- Agendar: Criar o agendamento.
- criar_servico: Se precisar cadastrar um serviço novo.
- confirmar_agendamento: Apenas se o cliente estiver respondendo a uma confirmação.

## CONTEXTO
Nome: {{ $json.nome || 'cliente' }}
Telefone: {{ $json.telefone }}
Mensagem: {{ $json.mensagem }}
`;
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('n8n_workflows.json updated with explicit insert and improved prompt.');
