import { neon } from '@neondatabase/serverless'
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const sql = neon(process.env.DATABASE_URL)
const schemaPath = path.resolve(__dirname, '..', 'lib', 'schema.sql')
const schema = fs.readFileSync(schemaPath, 'utf-8')

const statements = schema
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0)

for (const stmt of statements) {
  console.log(`Executing: ${stmt.slice(0, 80)}...`)
  await sql.query(stmt)
  console.log('  OK')
}

console.log('Applying schema updates...')
await sql.query(`ALTER TABLE items ADD COLUMN IF NOT EXISTS barcode TEXT UNIQUE`)
console.log('  OK')

console.log('Migration complete!')
