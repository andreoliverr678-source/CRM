const bcrypt = require('bcryptjs');

async function main() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  const isMatch = await bcrypt.compare(password, hash);

  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('Verify match:', isMatch);
  console.log('\nSQL to run:');
  console.log(`UPDATE public.users SET password_hash = '${hash}' WHERE email = 'admin@barbercrm.com';`);
}

main();
