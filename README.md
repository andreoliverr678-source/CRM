# BarberCRM - Sistema de Gestão para Barbearias

Um CRM completo e moderno desenvolvido com React, Node.js e TailwindCSS. Preparado para rodar em VPS usando Docker.

## Tecnologias Utilizadas
- **Frontend:** React, Vite, TailwindCSS, Lucide Icons, Recharts, Axios
- **Backend:** Node.js, Express, Supabase (PostgreSQL ready)
- **Infraestrutura:** Docker, Docker Compose, Nginx

## Estrutura do Projeto
- `/frontend` - Interface do usuário em React.
- `/backend` - API REST em Node.js preparada para conectar ao Supabase e n8n.
- `docker-compose.yml` - Arquivo para orquestrar os serviços em ambiente de produção/VPS.

## Como Executar Localmente (Desenvolvimento)

**1. Iniciando o Backend:**
```bash
cd backend
npm install
npm run dev
```
O backend rodará em `http://localhost:3000`.

**2. Iniciando o Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Acesse o sistema no seu navegador (geralmente `http://localhost:5173`).

## Como Executar na VPS (Produção / Docker)

Na sua VPS, certifique-se de ter o Docker e Docker Compose instalados.

1. Clone o repositório ou copie os arquivos.
2. Na pasta raiz do projeto, execute:
```bash
docker-compose up -d --build
```
3. O sistema estará disponível na porta 80. O frontend (Nginx) irá expor a aplicação e fará as requisições para o backend que roda internamente na porta 3000.

## Integração Supabase e n8n

### Supabase
O projeto já conta com a lógica para uso do Supabase. Para ativá-la:
1. Abra `backend/.env`
2. Preencha `SUPABASE_URL` e `SUPABASE_ANON_KEY`
Caso as chaves não sejam fornecidas, o sistema rodará em **modo Mock** (dados falsos), excelente para testes e visualização.

### n8n (WhatsApp)
A API expõe o endpoint `POST /api/messages/webhook` preparado para receber dados de webhooks do n8n. Configure seu n8n para enviar o JSON da mensagem do WhatsApp para essa rota, e a mensagem aparecerá em tempo real (após recarregar a tela ou implementar socket) na tela de conversas.
