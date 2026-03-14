import 'dotenv/config';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
  const [p] = await sql`SELECT total_budget FROM projects WHERE id = '544c1eb2-3d9f-4fa3-819e-a83522a917a5'`;
  console.log('DB total_budget:', p.total_budget);

  // Fix: budget should be in pence. £350,000 = 35,000,000 pence
  if (p.total_budget !== 35000000) {
    await sql`UPDATE projects SET total_budget = 35000000 WHERE id = '544c1eb2-3d9f-4fa3-819e-a83522a917a5'`;
    console.log('Fixed to 35000000 pence (£350,000)');
  }

  await sql.end();
}

main();
