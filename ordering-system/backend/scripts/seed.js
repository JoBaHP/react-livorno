const bcrypt = require('bcryptjs');
const db = require('../config/db');

(async () => {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD;
  const role = process.env.ADMIN_ROLE || 'admin';

  if (!password) {
    console.error('❌ ADMIN_PASSWORD is required (and not set).');
    process.exit(1);
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      `INSERT INTO users (username, password, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (username)
       DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role`,
      [username, hash, role]
    );
    console.log(`✅ Admin user upserted: username='${username}', role='${role}'`);
  } catch (err) {
    console.error('❌ Failed to seed admin user:', err.message);
    process.exit(1);
  } finally {
    try { await db.pool.end(); } catch (_) {}
  }
})();

