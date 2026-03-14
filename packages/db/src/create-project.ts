import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema.js';
import { seedProject } from './seed.js';

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  // Check if project already exists
  const existing = await sql`SELECT id FROM projects LIMIT 1`;
  if (existing.length > 0) {
    console.log('Project already exists:', existing[0].id);
    console.log('Use this project ID in your frontend.');
    await sql.end();
    return;
  }

  // Create default project
  const [project] = await sql`
    INSERT INTO projects (name, address, local_authority, total_budget, contingency_pct)
    VALUES ('Grange View Road Build', 'Grange View Road, Whetstone, N20 9EP', 'London Borough of Barnet', 50000000, 15)
    RETURNING id
  `;

  console.log('Project created:', project.id);

  // Seed with phases, tasks, inspections, contacts, etc.
  await seedProject(db, project.id);
  console.log('Seeded: 11 phases, 73 tasks, 13 budget categories, 17 inspections, 6 contacts, 6 CIL steps');
  console.log('\nYour project ID:', project.id);

  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
