import 'dotenv/config';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

const PROJECT_ID = '544c1eb2-3d9f-4fa3-819e-a83522a917a5';

async function main() {
  console.log('Updating project details...');

  // Update project with real data
  await sql`
    UPDATE projects SET
      name = 'Grange View Road Build',
      address = 'Plot B, Grange View Road, Whetstone, London N20 9EP',
      local_authority = 'London Borough of Barnet',
      total_budget = 35000000,
      contingency_pct = 15,
      target_completion = '2027-07-13'
    WHERE id = ${PROJECT_ID}
  `;
  console.log('  Project updated (£350,000 budget, target: 13 Jul 2027)');

  // Update budget category allocations based on £350k
  const categories = [
    { name: 'Professional Fees', amount: 4200000, pct: '12.00' },
    { name: 'Statutory & Regulatory', amount: 875000, pct: '2.50' },
    { name: 'Groundworks & Foundations', amount: 4200000, pct: '12.00' },
    { name: 'Superstructure', amount: 10500000, pct: '30.00' },
    { name: 'Roof', amount: 3500000, pct: '10.00' },
    { name: 'First Fix', amount: 5950000, pct: '17.00' },
    { name: 'Plastering & Screeding', amount: 1400000, pct: '4.00' },
    { name: 'Second Fix & Finishes', amount: 8750000, pct: '25.00' },
    { name: 'External Works', amount: 3500000, pct: '10.00' },
    { name: 'Utilities & Connections', amount: 1400000, pct: '4.00' },
    { name: 'Insurance & Warranty', amount: 525000, pct: '1.50' },
    { name: 'Site Costs', amount: 1050000, pct: '3.00' },
    { name: 'Contingency', amount: 5250000, pct: '15.00' },
  ];

  for (const cat of categories) {
    await sql`
      UPDATE budget_categories
      SET allocated_amount = ${cat.amount}, typical_pct = ${cat.pct}
      WHERE project_id = ${PROJECT_ID} AND name = ${cat.name}
    `;
  }
  console.log('  Budget categories updated with £350k allocations');

  // Add real contacts
  console.log('Adding professional contacts...');

  // First clear any non-council contacts
  // Keep existing seeded contacts, add new ones

  const contacts = [
    {
      name: 'A3D Architecture',
      role: 'Architect',
      company: 'A3D',
      notes: 'Project architect - RIBA stages 0-7',
      is_pinned: true,
    },
    {
      name: 'Self Build Zone',
      role: 'Insurance & Warranty',
      company: 'Self Build Zone',
      phone: '0345 230 9874',
      email: 'info@selfbuildzone.com',
      website: 'https://www.selfbuildzone.com',
      notes: 'Site insurance + 10-year structural warranty provider. Get quotes before starting.',
    },
    {
      name: 'Peter Barry Surveyors',
      role: 'Party Wall Surveyor',
      company: 'Peter Barry',
      phone: '0208 530 2555',
      email: 'surveying@peterbarry.co.uk',
      address: 'Whetstone, London N20 9AE',
      website: 'https://www.peterbarry.co.uk',
      notes: 'Local to Whetstone. Needed if Plot A shares party wall.',
    },
    {
      name: 'Thames Water',
      role: 'Water Utility',
      company: 'Thames Water',
      phone: '0800 009 3921',
      website: 'https://www.thameswater.co.uk',
      notes: 'Water connection + check for public sewers within 3m of build. Apply early - 3-6 month lead time.',
    },
    {
      name: 'UKPN (UK Power Networks)',
      role: 'Electricity Utility',
      company: 'UK Power Networks',
      phone: '0800 029 4285',
      website: 'https://www.ukpowernetworks.co.uk',
      notes: 'New electricity connection. Apply 3+ months before needed.',
    },
    {
      name: 'Cadent Gas',
      role: 'Gas Utility',
      company: 'Cadent',
      phone: '0345 835 1111',
      website: 'https://www.cadentgas.com',
      notes: 'New gas connection. Apply 3+ months before needed.',
    },
    {
      name: 'HMRC VAT Reclaim',
      role: 'VAT Reclaim',
      company: 'HMRC',
      phone: '0300 322 7073',
      website: 'https://www.gov.uk/guidance/vat-refunds-for-new-builds-if-youre-a-diy-housebuilder',
      notes: 'DIY Housebuilders Scheme (VAT431NB). Claim within 6 months of Completion Certificate. Estimated reclaim: £19,000-25,000.',
    },
  ];

  for (const c of contacts) {
    await sql`
      INSERT INTO contacts (project_id, name, role, company, phone, email, address, website, notes, is_pinned)
      VALUES (${PROJECT_ID}, ${c.name}, ${c.role}, ${c.company || null}, ${c.phone || null}, ${c.email || null}, ${c.address || null}, ${c.website || null}, ${c.notes || null}, ${c.is_pinned || false})
    `;
  }
  console.log(`  Added ${contacts.length} professional contacts`);

  // Add planning conditions (typical for Barnet new-build)
  console.log('Adding planning conditions...');

  const conditions = [
    { num: 1, desc: 'Approval of external materials (brick, roof tiles, render, windows) - samples/details to be submitted', type: 'pre_commencement' },
    { num: 2, desc: 'Detailed landscaping scheme (hard and soft, including planting species, boundary treatment)', type: 'pre_commencement' },
    { num: 3, desc: 'Construction Management Plan - delivery routes, hours of work, dust/noise mitigation, site worker parking', type: 'pre_commencement' },
    { num: 4, desc: 'Surface water drainage strategy (SuDS compliance)', type: 'pre_commencement' },
    { num: 5, desc: 'Biodiversity Net Gain plan demonstrating BNG compliance', type: 'pre_commencement' },
    { num: 6, desc: 'Tree protection plan (if trees on or adjacent to site)', type: 'pre_commencement' },
    { num: 7, desc: 'Cycle parking provision per London Plan standards', type: 'pre_occupation' },
    { num: 8, desc: 'Electric vehicle charging point installed per Part S Building Regulations', type: 'pre_occupation' },
    { num: 9, desc: 'Refuse and recycling storage details approved and implemented', type: 'pre_occupation' },
    { num: 10, desc: 'Water efficiency - maximum 105 litres/person/day per London Plan', type: 'pre_occupation' },
    { num: 11, desc: 'Hours of construction: Mon-Fri 8am-6pm, Sat 8am-1pm, no work Sundays/Bank Holidays', type: 'ongoing' },
    { num: 12, desc: 'Compliance with approved plans - any variations require formal approval', type: 'ongoing' },
    { num: 13, desc: 'No additional windows or openings without prior consent (privacy/overlooking)', type: 'ongoing' },
    { num: 14, desc: 'Permitted development rights removed (Article 4 direction)', type: 'ongoing' },
    { num: 15, desc: 'Party Wall Act obligations - serve notices on adjacent owners before work', type: 'informative' },
    { num: 16, desc: 'Thames Water - no building or planting within 3m of public sewers', type: 'informative' },
    { num: 17, desc: 'CIL liability notice - self-build exemption must be claimed before commencement', type: 'informative' },
  ];

  for (const cond of conditions) {
    await sql`
      INSERT INTO planning_conditions (project_id, condition_number, description, condition_type, status)
      VALUES (${PROJECT_ID}, ${cond.num}, ${cond.desc}, ${cond.type}, 'not_started')
    `;
  }
  console.log(`  Added ${conditions.length} planning conditions`);

  // Add pre-loaded decisions
  console.log('Adding key decisions...');

  const decisions = [
    { title: 'External brick/cladding selection', category: 'Materials', deadline: '2027-02-01', leadTime: 42, notes: 'Samples needed for planning condition discharge. Consider London stock brick or contemporary render.' },
    { title: 'Roof tile/covering selection', category: 'Materials', deadline: '2027-02-01', leadTime: 28, notes: 'Must match planning approval. Natural slate vs concrete tile vs standing seam zinc.' },
    { title: 'Window supplier & specification', category: 'Materials', deadline: '2027-02-15', leadTime: 56, notes: 'Aluminium vs timber vs composite. Triple glazing for energy performance. Long lead time - order early.' },
    { title: 'Kitchen design & supplier', category: 'Finishes', deadline: '2027-03-01', leadTime: 84, notes: 'Needs to be finalised before first fix for plumbing/electrical positions.' },
    { title: 'Bathroom design & sanitaryware', category: 'Finishes', deadline: '2027-03-01', leadTime: 56, notes: 'Tile selection, sanitaryware, shower/bath choice. Affects first fix plumbing layout.' },
    { title: 'Heating system (boiler vs heat pump)', category: 'Services', deadline: '2027-01-15', leadTime: 42, notes: 'Air source heat pump may be required under Part L. Affects design, floor build-up, and running costs.' },
    { title: 'Flooring throughout', category: 'Finishes', deadline: '2027-04-01', leadTime: 28, notes: 'Engineered wood, porcelain tile, polished concrete? Affects screed specification.' },
    { title: 'Staircase design', category: 'Structural', deadline: '2027-02-01', leadTime: 56, notes: 'Timber, steel+glass, or concrete? Affects structural design. 3 storeys = important feature.' },
    { title: 'Sauna specification', category: 'Finishes', deadline: '2027-04-01', leadTime: 42, notes: 'First floor sauna - traditional vs infrared. Needs waterproofing, ventilation, and dedicated electrical circuit.' },
    { title: 'Main contractor vs project management', category: 'Procurement', deadline: '2026-12-01', leadTime: 60, notes: 'Main contractor (simpler, more expensive) vs managing individual trades (cheaper, more hands-on). Key decision affecting entire build.' },
  ];

  for (const d of decisions) {
    const orderByDate = new Date(d.deadline);
    orderByDate.setDate(orderByDate.getDate() - d.leadTime);

    await sql`
      INSERT INTO decisions (project_id, title, category, status, deadline, lead_time_days, order_by_date, notes)
      VALUES (${PROJECT_ID}, ${d.title}, ${d.category}, 'not_started', ${d.deadline}, ${d.leadTime}, ${orderByDate.toISOString().split('T')[0]}, ${d.notes})
    `;
  }
  console.log(`  Added ${decisions.length} key decisions`);

  await sql.end();
  console.log('\nDone! Database populated with real project data.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
