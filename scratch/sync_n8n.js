const fs = require('fs');

const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTkzMGRkNy00ZDFkLTRjMmItODA1YS05NGU2NmNjYjZhNDYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNmFkM2Y4YTgtMzk1ZS00M2VkLTk2OWMtNTRmYjdiOTMyNmNmIiwiaWF0IjoxNzc4NTE3MzU1LCJleHAiOjE3ODEwNjQwMDB9.7x5v0A4DZxbHDRW6gaau-Q_1x72TP0P4PYAqhXUVlW0';
const baseUrl = 'https://n8n.andreverissimo.shop/api/v1';

async function updateWorkflows() {
  const filePath = 'c:\\Users\\adasilva\\Downloads\\CRM\\n8n_workflows.json';
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  for (const workflow of data.data) {
    const workflowId = workflow.id;
    console.log(`Updating workflow: ${workflow.name} (${workflowId})...`);

    const body = {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: workflow.connections,
      settings: {} // Empty settings to test
    };

    try {
      const response = await fetch(`${baseUrl}/workflows/${workflowId}`, {
        method: 'PUT',
        headers: {
          'X-N8N-API-KEY': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        console.log(`Successfully updated ${workflow.name}`);
      } else {
        const errText = await response.text();
        console.error(`Failed to update ${workflow.name}: ${response.status} ${errText}`);
      }
    } catch (err) {
      console.error(`Error updating ${workflow.name}:`, err.message);
    }
  }
}

updateWorkflows();
