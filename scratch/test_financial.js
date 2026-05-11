const http = require('http');

const data = JSON.stringify({
  appointment_id: '6f149646-5484-46ca-807f-5ab043caed28',
  service: 'Corte',
  payment_method: 'pix',
  status: 'pago'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/financial',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`BODY: ${body}`);
  });
});

req.on('error', (e) => {
  console.error(`ERROR: ${e.message}`);
});

req.write(data);
req.end();
