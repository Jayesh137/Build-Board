import 'dotenv/config';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);
const PID = '544c1eb2-3d9f-4fa3-819e-a83522a917a5';

async function main() {
  // 1. FIX BUDGET - allocations must add up to £350,000 (35,000,000 pence)
  // Realistic breakdown for a £350k self-build
  console.log('Fixing budget allocations to total £350,000...');
  const budget = [
    { name: 'Professional Fees', amount: 2800000, pct: '8.00' },         // £28,000
    { name: 'Statutory & Regulatory', amount: 700000, pct: '2.00' },     // £7,000
    { name: 'Groundworks & Foundations', amount: 3500000, pct: '10.00' }, // £35,000
    { name: 'Superstructure', amount: 5600000, pct: '16.00' },           // £56,000
    { name: 'Roof', amount: 2800000, pct: '8.00' },                     // £28,000
    { name: 'First Fix', amount: 3500000, pct: '10.00' },               // £35,000
    { name: 'Plastering & Screeding', amount: 1050000, pct: '3.00' },   // £10,500
    { name: 'Second Fix & Finishes', amount: 5250000, pct: '15.00' },   // £52,500
    { name: 'External Works', amount: 2100000, pct: '6.00' },           // £21,000
    { name: 'Utilities & Connections', amount: 1050000, pct: '3.00' },   // £10,500
    { name: 'Insurance & Warranty', amount: 525000, pct: '1.50' },       // £5,250
    { name: 'Site Costs', amount: 875000, pct: '2.50' },                // £8,750
    { name: 'Contingency', amount: 5250000, pct: '15.00' },             // £52,500
  ];
  // Total: 28000+7000+35000+56000+28000+35000+10500+52500+21000+10500+5250+8750+52500 = £350,000 ✓

  for (const cat of budget) {
    await sql`
      UPDATE budget_categories
      SET allocated_amount = ${cat.amount}, typical_pct = ${cat.pct}
      WHERE project_id = ${PID} AND name = ${cat.name}
    `;
  }
  console.log('  Budget fixed: 13 categories totalling £350,000');

  // 2. REMOVE NON-ESSENTIAL CONTACTS
  console.log('Removing non-essential contacts...');
  const removeContacts = [
    'Barnet Council Tax',
    'Barnet Street Naming',
    'Barnet Highways',
    'Barnet CIL Team',  // covered by Barnet Planning
  ];
  for (const name of removeContacts) {
    const result = await sql`DELETE FROM contacts WHERE project_id = ${PID} AND name = ${name} RETURNING name`;
    if (result.length > 0) console.log(`  Removed: ${name}`);
  }

  // 3. REMOVE INFORMATIVE PLANNING CONDITIONS (just notes, not real conditions)
  console.log('Removing informative conditions (FYI only)...');
  const result = await sql`
    DELETE FROM planning_conditions
    WHERE project_id = ${PID} AND condition_type = 'informative'
    RETURNING description
  `;
  console.log(`  Removed ${result.length} informative conditions`);

  // Re-number remaining conditions
  const remaining = await sql`
    SELECT id FROM planning_conditions
    WHERE project_id = ${PID}
    ORDER BY condition_number
  `;
  for (let i = 0; i < remaining.length; i++) {
    await sql`UPDATE planning_conditions SET condition_number = ${i + 1} WHERE id = ${remaining[i].id}`;
  }
  console.log(`  Re-numbered ${remaining.length} conditions`);

  // 4. SIMPLIFY PHASE A - consolidate CIL tasks into one
  console.log('Simplifying Phase A...');

  // Get Phase A id
  const [phaseA] = await sql`SELECT id FROM phases WHERE project_id = ${PID} AND name LIKE '%Pre-Construction%'`;
  if (phaseA) {
    // Remove individual CIL form tasks (tracked separately in CIL module)
    const cilTasks = await sql`
      DELETE FROM tasks
      WHERE phase_id = ${phaseA.id} AND (title LIKE 'CIL:%')
      RETURNING title
    `;
    console.log(`  Removed ${cilTasks.length} CIL tasks (tracked in CIL module instead)`);

    // Consolidate utility applications into one task
    const utilTasks = await sql`
      DELETE FROM tasks
      WHERE phase_id = ${phaseA.id} AND title LIKE 'Apply for%connection'
      RETURNING title
    `;
    if (utilTasks.length > 0) {
      await sql`
        INSERT INTO tasks (phase_id, title, description, status, sort_order, notes)
        VALUES (${phaseA.id}, 'Apply for utility connections', 'Water (Thames Water), electricity (UKPN), gas (Cadent). Apply 3+ months before needed.', 'not_started', 10, 'Water: 0800 009 3921 | UKPN: 0800 029 4285 | Cadent: 0345 835 1111')
      `;
      console.log(`  Consolidated ${utilTasks.length} utility tasks into one`);
    }

    // Remove "Sign building contract" (part of appointing contractor)
    await sql`DELETE FROM tasks WHERE phase_id = ${phaseA.id} AND title = 'Sign building contract'`;

    // Re-order remaining tasks
    const tasks = await sql`SELECT id FROM tasks WHERE phase_id = ${phaseA.id} ORDER BY sort_order`;
    for (let i = 0; i < tasks.length; i++) {
      await sql`UPDATE tasks SET sort_order = ${i} WHERE id = ${tasks[i].id}`;
    }
    console.log(`  Phase A now has ${tasks.length} tasks (was 15)`);
  }

  // 5. CHECK CIL STEPS
  const cilSteps = await sql`SELECT * FROM cil_steps WHERE project_id = ${PID} ORDER BY step_number`;
  if (cilSteps.length === 0) {
    console.log('CIL steps missing! Re-creating...');
    const steps = [
      { num: 1, form: 'Form 2', desc: 'Assumption of Liability - submit after planning granted', blocking: false },
      { num: 2, form: 'Liability Notice', desc: 'Receive Liability Notice from council', blocking: false },
      { num: 3, form: 'Form 7 Part 1', desc: 'Self-Build Exemption Claim - MUST submit before ANY work starts', blocking: true },
      { num: 4, form: 'Exemption Confirmation', desc: 'Receive written confirmation of exemption from council', blocking: true },
      { num: 5, form: 'Form 6', desc: 'Commencement Notice - submit before starting work on site', blocking: true },
      { num: 6, form: 'Form 7 Part 2', desc: 'Post-completion evidence - submit within 6 months of Completion Certificate', blocking: false },
    ];
    for (const s of steps) {
      await sql`
        INSERT INTO cil_steps (project_id, step_number, form_name, description, status, is_blocking)
        VALUES (${PID}, ${s.num}, ${s.form}, ${s.desc}, 'not_started', ${s.blocking})
      `;
    }
    console.log('  Created 6 CIL steps');
  } else {
    console.log(`  CIL steps OK (${cilSteps.length} steps)`);
  }

  // Print final summary
  const [taskCount] = await sql`SELECT count(*) as c FROM tasks t JOIN phases p ON t.phase_id = p.id WHERE p.project_id = ${PID}`;
  const [contactCount] = await sql`SELECT count(*) as c FROM contacts WHERE project_id = ${PID}`;
  const [conditionCount] = await sql`SELECT count(*) as c FROM planning_conditions WHERE project_id = ${PID}`;
  const [decisionCount] = await sql`SELECT count(*) as c FROM decisions WHERE project_id = ${PID}`;
  const [inspectionCount] = await sql`SELECT count(*) as c FROM inspections WHERE project_id = ${PID}`;
  const [catCount] = await sql`SELECT count(*) as c FROM budget_categories WHERE project_id = ${PID}`;

  console.log('\n=== FINAL SUMMARY ===');
  console.log(`  Tasks: ${taskCount.c}`);
  console.log(`  Budget categories: ${catCount.c}`);
  console.log(`  Contacts: ${contactCount.c}`);
  console.log(`  Planning conditions: ${conditionCount.c}`);
  console.log(`  Decisions: ${decisionCount.c}`);
  console.log(`  Inspections: ${inspectionCount.c}`);

  await sql.end();
}

main().catch(e => { console.error(e); process.exit(1); });
