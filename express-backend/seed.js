const db = require('./db')
const bcrypt = require('bcryptjs')

function seed() {
  console.log('Seeding database...')

  // ── Demo users ─────────────────────────────────────────────
  const users = [
    { name:'Admin User',       email:'admin@elshaddai.in',      password:'Admin@123',   role:'ADMIN',          phone:'9876500001', organisation_name:'El Shaddai Interiors' },
    { name:'Super Admin',      email:'superadmin@elshaddai.in', password:'Super@123',   role:'SUPER_ADMIN',    phone:'9876500002', organisation_name:'El Shaddai Interiors' },
    { name:'Kiran Sharma',     email:'kiran@elshaddai.in',      password:'Design@123',  role:'DESIGNER',       phone:'9876543210', organisation_name:'El Shaddai Interiors', years_experience:8 },
    { name:'Lakshmi Iyer',     email:'lakshmi@elshaddai.in',    password:'Design@123',  role:'DESIGNER',       phone:'9876543211', organisation_name:'El Shaddai Interiors', years_experience:6 },
    { name:'Mohammed Farook',  email:'farook@elshaddai.in',     password:'Build@123',   role:'BUILDER',        phone:'9876543212', specialisation:'Civil & Tiling' },
    { name:'Priya Menon',      email:'priya@elshaddai.in',      password:'Admin@123',   role:'ADMIN',          phone:'9876543213', organisation_name:'El Shaddai Interiors' },
    { name:'Ravi Kumar',       email:'ravi@elshaddai.in',       password:'Work@1234',   role:'WORKSHOP_WORKER',phone:'9876543216', specialisation:'Furniture Fabrication' },
    { name:'Deepa Nair',       email:'deepa.nair@gmail.com',    password:'Client@123',  role:'CLIENT',         phone:'9876543220', city:'Chennai' },
    { name:'Vinay Kapoor',     email:'vinay.kapoor@gmail.com',  password:'Client@123',  role:'CLIENT',         phone:'9876543221', city:'Bangalore' },
    { name:'Anil Mehta',       email:'anil.mehta@gmail.com',    password:'Client@123',  role:'CLIENT',         phone:'9876543222', city:'Mumbai' },
  ]

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (name,email,password_hash,phone,role,city,organisation_name,years_experience,specialisation)
    VALUES (?,?,?,?,?,?,?,?,?)
  `)
  for (const u of users) {
    const hash = bcrypt.hashSync(u.password, 10)
    insertUser.run(u.name, u.email, hash, u.phone||null, u.role, u.city||null, u.organisation_name||null, u.years_experience||null, u.specialisation||null)
  }
  console.log(`✓ ${users.length} users seeded`)

  // ── Employees ─────────────────────────────────────────────
  const emps = [
    { name:'Kiran Sharma',    role:'Lead Designer',     department:'Design',       phone:'9876543210', email:'kiran@elshaddai.in',    salary:85000, join_date:'2022-03-15' },
    { name:'Lakshmi Iyer',    role:'Lead Designer',     department:'Design',       phone:'9876543211', email:'lakshmi@elshaddai.in',  salary:82000, join_date:'2021-07-01' },
    { name:'Mohammed Farook', role:'Site Builder',      department:'Construction', phone:'9876543212', email:'farook@elshaddai.in',   salary:55000, join_date:'2020-11-10' },
    { name:'Priya Menon',     role:'Project Manager',   department:'Management',   phone:'9876543213', email:'priya@elshaddai.in',    salary:75000, join_date:'2023-01-20' },
    { name:'Suresh Pillai',   role:'Site Supervisor',   department:'Construction', phone:'9876543214', email:'suresh@elshaddai.in',   salary:52000, join_date:'2019-06-05' },
    { name:'Anitha Raj',      role:'Interior Designer', department:'Design',       phone:'9876543215', email:'anitha@elshaddai.in',   salary:68000, join_date:'2023-04-12' },
    { name:'Ravi Kumar',      role:'Factory Head',      department:'Factory',      phone:'9876543216', email:'ravi@elshaddai.in',     salary:60000, join_date:'2021-09-30' },
    { name:'Deepa Thomas',    role:'QC Inspector',      department:'Quality',      phone:'9876543217', email:'deepa.t@elshaddai.in',  salary:58000, join_date:'2022-08-22' },
  ]
  const insertEmp = db.prepare(`INSERT OR IGNORE INTO employees (name,role,department,phone,email,salary,join_date,status) VALUES (?,?,?,?,?,?,?,'ACTIVE')`)
  for (const e of emps) insertEmp.run(e.name, e.role, e.department, e.phone, e.email, e.salary, e.join_date)
  console.log(`✓ ${emps.length} employees seeded`)

  // ── Projects ──────────────────────────────────────────────
  const clientDeepaNair  = db.prepare("SELECT id FROM users WHERE email='deepa.nair@gmail.com'").get()
  const clientVinayKapoor = db.prepare("SELECT id FROM users WHERE email='vinay.kapoor@gmail.com'").get()

  const projects = [
    { number:'PRJ-0012', name:'Nair Residence - 3BHK Interior',     client_id:clientDeepaNair?.id,   client_name:'Deepa Nair',    status:'INSTALLATION',       budget:1850000, city:'Chennai',   start:'2026-04-02', end:'2026-08-15', pct:72 },
    { number:'PRJ-0009', name:'Kapoor Office - Fit-Out',             client_id:clientVinayKapoor?.id, client_name:'Vinay Kapoor',  status:'QC',                 budget:3200000, city:'Bangalore', start:'2026-03-15', end:'2026-07-30', pct:90 },
    { number:'PRJ-0015', name:'Sharma Villa - Luxury Interior',      client_id:null,                  client_name:'Rahul Sharma',  status:'DESIGN',             budget:5600000, city:'Chennai',   start:'2026-05-08', end:'2026-12-20', pct:15 },
    { number:'PRJ-0014', name:'Mehta Penthouse - Modern Fit-Out',    client_id:null,                  client_name:'Anil Mehta',    status:'CREATED',            budget:2800000, city:'Mumbai',    start:'2026-06-01', end:'2026-11-30', pct:5  },
    { number:'PRJ-0013', name:'Sundar Restaurant - Interior Design', client_id:null,                  client_name:'Sundar Rajan',  status:'MATERIALS_PROCURED', budget:1200000, city:'Chennai',   start:'2026-04-20', end:'2026-09-10', pct:55 },
  ]
  const insertProj = db.prepare(`INSERT OR IGNORE INTO projects (project_number,name,client_id,client_name,status,budget,city,start_date,expected_end,progress_pct) VALUES (?,?,?,?,?,?,?,?,?,?)`)
  for (const p of projects) insertProj.run(p.number, p.name, p.client_id||null, p.client_name, p.status, p.budget, p.city, p.start, p.end, p.pct)
  console.log(`✓ ${projects.length} projects seeded`)

  // ── Vendors ───────────────────────────────────────────────
  const vendors = [
    { name:'Rajesh Timbers',    category:'Wood & Ply',    contact:'Rajesh Nair',   phone:'9944112233', email:'rajesh@timbers.in',   city:'Chennai',   rating:4.8, on_time:95 },
    { name:'Stone Imports Pvt', category:'Stone & Tiles', contact:'Arjun Pillai',  phone:'9944112234', email:'stone@imports.in',    city:'Bangalore', rating:4.5, on_time:88 },
    { name:'National Paints',   category:'Paint',         contact:'Sunil Kumar',   phone:'9944112235', email:'sunil@natpaint.in',   city:'Chennai',   rating:4.6, on_time:92 },
    { name:'Hettich India',     category:'Hardware',      contact:'Kavya Menon',   phone:'9944112236', email:'kavya@hettich.in',    city:'Mumbai',    rating:4.9, on_time:98 },
    { name:'Local Workshop',    category:'Fabrication',   contact:'Ramu Krishnan', phone:'9944112237', email:'ramu@workshop.in',    city:'Chennai',   rating:4.2, on_time:85 },
  ]
  const insertVendor = db.prepare(`INSERT OR IGNORE INTO vendors (name,category,contact_name,phone,email,city,rating,on_time_pct) VALUES (?,?,?,?,?,?,?,?)`)
  for (const v of vendors) insertVendor.run(v.name, v.category, v.contact, v.phone, v.email, v.city, v.rating, v.on_time)
  console.log(`✓ ${vendors.length} vendors seeded`)

  // ── Factory Jobs ──────────────────────────────────────────
  const p1 = db.prepare("SELECT id FROM projects WHERE project_number='PRJ-0012'").get()
  const p2 = db.prepare("SELECT id FROM projects WHERE project_number='PRJ-0009'").get()
  const p5 = db.prepare("SELECT id FROM projects WHERE project_number='PRJ-0013'").get()
  const insertFactory = db.prepare(`INSERT OR IGNORE INTO factory_jobs (project_id,job_number,item_type,stage,assigned_to) VALUES (?,?,?,?,?)`)
  const jobs = [
    [p1?.id, 'FAB-018', 'Master Bedroom Wardrobe — 3-door sliding', 'ASSEMBLY',   'Ravi Kumar'],
    [p1?.id, 'FAB-019', 'Kitchen Cabinet Carcass set',              'POLISHING',  'Ravi Kumar'],
    [p2?.id, 'FAB-020', 'Reception Counter — walnut veneer',        'PACKING',    'Ravi Kumar'],
    [p2?.id, 'FAB-021', 'Conference Room TV Unit',                  'DISPATCHED', 'Ravi Kumar'],
    [p5?.id, 'FAB-022', 'Restaurant Bar Counter frame',             'CUTTING',    'Ravi Kumar'],
  ]
  for (const j of jobs) insertFactory.run(...j)
  console.log(`✓ ${jobs.length} factory jobs seeded`)

  // ── Attendance (today) ─────────────────────────────────────
  const today = new Date().toISOString().slice(0,10)
  const attendanceData = [
    ['Kiran Sharma',    '08:30','18:00','PRESENT',91],
    ['Lakshmi Iyer',    '09:00','18:30','PRESENT',88],
    ['Mohammed Farook', '08:15','17:45','PRESENT',82],
    ['Priya Menon',     '09:30', null,  'PRESENT',79],
    ['Suresh Pillai',    null,   null,  'LEAVE',  null],
    ['Anitha Raj',      '09:45', null,  'LATE',   68],
    ['Ravi Kumar',      '08:50','18:00','PRESENT',85],
    ['Deepa Thomas',    '08:00','17:30','PRESENT',93],
  ]
  const insertAtt = db.prepare(`INSERT OR IGNORE INTO attendance (employee_id,date,login_time,logout_time,status,productivity_score) VALUES (?,?,?,?,?,?)`)
  for (const [name, login, logout, status, score] of attendanceData) {
    const emp = db.prepare('SELECT id FROM employees WHERE name=?').get(name)
    if (emp) insertAtt.run(emp.id, today, login, logout, status, score)
  }
  console.log('✓ Attendance seeded')

  // ── QC Checklists ─────────────────────────────────────────
  if (p2) {
    const insertQC = db.prepare(`INSERT OR IGNORE INTO qc_checklists (project_id,phase,item,status,checked_at) VALUES (?,?,?,?,?)`)
    const qcItems = [
      [p2.id,'INSTALLATION','False ceiling level check',          'PASS',   '2026-06-10T09:00:00'],
      [p2.id,'INSTALLATION','Electrical points — all functional', 'PASS',   '2026-06-10T10:30:00'],
      [p2.id,'INSTALLATION','Tile grout — uniform & sealed',      'PASS',   '2026-06-11T11:00:00'],
      [p2.id,'INSTALLATION','Wardrobe alignment & finish',         'FAIL',   '2026-06-11T14:00:00'],
      [p2.id,'QC',          'Paint finish — no brush marks',      'PENDING', null],
      [p2.id,'QC',          'Hardware snag list cleared',         'PENDING', null],
      [p2.id,'QC',          'Final deep clean done',              'PENDING', null],
    ]
    for (const q of qcItems) insertQC.run(...q)
    console.log('✓ QC checklists seeded')
  }

  // ── Site Diary ────────────────────────────────────────────
  if (p1) {
    const insertDiary = db.prepare(`INSERT OR IGNORE INTO site_diary (project_id,report_date,work_done,workers_count,weather) VALUES (?,?,?,?,?)`)
    insertDiary.run(p1.id, today, 'Wardrobe installation in master bedroom 80% complete. Skirting work in living room done.', 6, 'Sunny')
    if (p2) insertDiary.run(p2.id, today, 'QC inspection in progress. Punch list being cleared by site team.', 4, 'Cloudy')
    console.log('✓ Site diary seeded')
  }

  console.log('\n✅ Database seeded successfully!')
  console.log('\nDemo login accounts:')
  users.forEach(u => console.log(`  ${u.role.padEnd(16)} ${u.email}  /  ${u.password}`))
}

seed()
