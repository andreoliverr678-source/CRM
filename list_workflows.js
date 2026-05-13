const https = require('https');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTkzMGRkNy00ZDFkLTRjMmItODA1YS05NGU2NmNjYjZhNDYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiMTliNDM0NTctMzcyMS00MmZiLWJmNGQtZjFlNWI5NjRhZjEzIiwiaWF0IjoxNzc4NjkwMzA2fQ.C_mF7KLPGWIgHJRk35HhP0RFDuP-k-b6_-wYwpEADOc";
const options = {
  hostname: 'n8n.andreverissimo.shop',
  path: '/api/v1/workflows',
  headers: {
    'X-N8N-API-KEY': token
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      json.data.forEach(wf => {
        console.log(`ID: ${wf.id} | Name: ${wf.name}`);
      });
    } catch (e) {
      console.log('Error parsing JSON');
    }
  });
}).on('error', (err) => {
  console.log('Error: ' + err.message);
});
