const http = require('http');

const data = JSON.stringify({
  appointment_id: '1a4f77df-60f3-41d7-a2ae-21f20796fef5',
  service: 'Sobrancelha',
  payment_method: 'dinheiro',
  status: 'pago'
});

const options = {
  hostname: 'localhost', port: 3000, path: '/api/financial', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => { console.log(`STATUS: ${res.statusCode}`); console.log(`BODY: ${body}`); });
});

req.write(data);
req.end();
