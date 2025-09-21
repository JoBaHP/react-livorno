const fs = require('fs');
const path = require('path');

// Ensure environment variables (DATABASE_URL, etc.) are loaded before requiring db config
const envPath = path.resolve(__dirname, '..', '.env');
require('dotenv').config({ path: envPath });

const db = require('../config/db');

function stripComments(input) {
  // Remove block comments /* ... */
  let sql = input.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove single-line comments starting with --
  sql = sql.replace(/^\s*--.*$/gm, '');
  return sql;
}

function splitSql(sql) {
  // Naive split on semicolons not inside strings; good enough for simple schema files
  const statements = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const prev = i > 0 ? sql[i - 1] : '';
    if (ch === "'" && prev !== '\\' && !inDouble) inSingle = !inSingle;
    if (ch === '"' && prev !== '\\' && !inSingle) inDouble = !inDouble;
    if (ch === ';' && !inSingle && !inDouble) {
      statements.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) statements.push(current);
  return statements
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith('--'));
}

async function runFile(filePath) {
  const abs = path.resolve(__dirname, '..', 'config', filePath);
  console.log(`\nApplying schema: ${abs}`);
  const raw = fs.readFileSync(abs, 'utf8');
  const sql = stripComments(raw);
  const statements = splitSql(sql);
  console.log(`Found ${statements.length} SQL statements in ${filePath}`);
  let ok = 0;
  for (const stmt of statements) {
    try {
      // Skip psql meta-commands if present
      if (stmt.startsWith('\\')) continue;
      await db.query(stmt);
      ok++;
    } catch (err) {
      const msg = (err && err.message) || String(err);
      // Continue on existing objects; stop on others if STOP_ON_MIGRATION_ERROR=true
      const stop = process.env.STOP_ON_MIGRATION_ERROR === 'true';
      console.warn(`Migration statement failed: ${msg}`);
      if (stop) throw err;
    }
  }
  console.log(`Applied ${ok}/${statements.length} statements from ${filePath}`);
}

(async () => {
  try {
    await runFile('database_schema.sql');
    await runFile('database_delivery_schema.sql');
    console.log('✅ Database migration complete');
  } catch (e) {
    console.error('❌ Migration failed:', e.message);
    process.exit(1);
  } finally {
    try { await db.pool.end(); } catch (_) {}
  }
})();
