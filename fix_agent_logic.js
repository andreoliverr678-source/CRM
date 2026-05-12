
const fs = require('fs');

const wf = JSON.parse(fs.readFileSync('workflow_temp.json'));

// 1. Update Agent System Message
const agentNode = wf.nodes.find(n => n.name === 'André, Atendente');

const newSystemMessage = `Hoje é {{ $now.setZone('America/Sao_Paulo').format('EEEE, dd/MM/yyyy') }}, {{ $now.setZone('America/Sao_Paulo').format('HH:mm') }}

━━━━━━━━━━━━━━━━━
📋 CLIENTE
━━━━━━━━━━━━━━━━━
Nome: {{ $('Analiz Client').first().json.nome || 'não informado' }}
Telefone: {{ $('Dados').first().json.telefone }}
Status: {{ $('Analiz Client').first().json.status || 'lead' }}

━━━━━━━━━━━━━━━━━
🎭 IDENTIDADE
━━━━━━━━━━━━━━━━━
Você é André, atendente virtual da Barbearia Alfa.
Seu atendimento é simpático, rápido, natural e direto.
Fale como barbeiro real no WhatsApp (ex: "fala irmão 👊", "fechou", "tamo junto").
Máximo 2 linhas por mensagem.

━━━━━━━━━━━━━━━━━
🛠️ FERRAMENTAS
━━━━━━━━━━━━━━━━━
🔹 servicos: Listar serviços e preços.

🔹 Agendar: USAR APENAS para NOVOS agendamentos do zero.
   - Status inicial: "pendente".

🔹 confirmar_agendamento: USAR QUANDO o cliente disser "SIM", "PODE MARCAR", "CONFIRMO" ou algo positivo para um horário já sugerido ou lembrete.
   - Esta ferramenta muda o status de 'pendente' para 'confirmado'.

━━━━━━━━━━━━━━━━━
🚨 LÓGICA DE CONFIRMAÇÃO
━━━━━━━━━━━━━━━━━
- Se o cliente disse "sim" para um horário que você propôs:
  1. Chame 'confirmar_agendamento'.
  2. NÃO chame 'Agendar' (isso criaria um duplicado).
- Só use 'Agendar' se for uma reserva nova ou se os dados mudarem.

━━━━━━━━━━━━━━━━━
🚫 REGRAS ABSOLUTAS
━━━━━━━━━━━━━━━━━
- NUNCA crie agendamentos duplicados.
- Se o cliente confirmar, apenas atualize o status.`;

agentNode.parameters.options = agentNode.parameters.options || {};
agentNode.parameters.options.systemMessage = newSystemMessage;

// 2. Add confirmar_agendamento tool
if (!wf.nodes.find(n => n.name === 'confirmar_agendamento')) {
    const confirmTool = {
        "parameters": {
            "operation": "update",
            "tableId": "agendamentos",
            "filters": {
                "conditions": [
                    {
                        "keyName": "telefone",
                        "condition": "eq",
                        "keyValue": "={{ $('Dados').item.json.telefone }}"
                    },
                    {
                        "keyName": "status",
                        "condition": "eq",
                        "keyValue": "pendente"
                    }
                ]
            },
            "fieldsUi": {
                "fieldValues": [
                    {
                        "fieldId": "status",
                        "fieldValue": "confirmado"
                    }
                ]
            },
            "toolDescription": "Use para confirmar (status=confirmado) um agendamento pendente quando o cliente disser SIM."
        },
        "id": "confirm-tool-unique-id",
        "name": "confirmar_agendamento",
        "type": "n8n-nodes-base.supabaseTool",
        "typeVersion": 1,
        "position": [11500, 8100],
        "credentials": {
            "supabaseApi": {
                "id": "HoI9l5OTgXnvzb6O",
                "name": "Supabase account"
            }
        }
    };
    wf.nodes.push(confirmTool);
    
    // Connections
    // Tool nodes must be connected AS INPUTS to the Agent node
    if (!wf.connections['confirmar_agendamento']) {
        wf.connections['confirmar_agendamento'] = {
            "main": [
                [
                    {
                        "node": "André, Atendente",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        };
    }
}

// 3. Improve Agendar description
const agendarTool = wf.nodes.find(n => n.name === 'Agendar');
if (agendarTool) {
    agendarTool.parameters.toolDescription = "Cria um NOVO agendamento. Use APENAS se não houver um agendamento pendente sendo confirmado.";
}

// 4. Save and Upload
fs.writeFileSync('workflow_fixed.json', JSON.stringify(wf));
console.log('Fixed workflow saved to workflow_fixed.json');
