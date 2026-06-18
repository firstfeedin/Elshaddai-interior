/**
 * El Shaddai — Lightweight Bridge Server
 * Runs on port 3001 using SQLite (no PostgreSQL needed)
 * Implements the same API contract as the full NestJS backend
 * Switch to NestJS by running `npm run dev` once PostgreSQL is ready
 */

const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Database = require('better-sqlite3')
const path = require('path')
const crypto = require('crypto')

const app = express()
const PORT = 3001
const JWT_SECRET = 'elshaddai-super-secret-jwt-key-2025-interior-design'
const DB_PATH = path.join(__dirname, 'lite.db')

// ── Database setup ────────────────────────────────────────────────
const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    name TEXT NOT NULL,
    phone TEXT,
    avatar TEXT,
    role TEXT NOT NULL DEFAULT 'CLIENT',
    org_id TEXT,
    profile_data TEXT DEFAULT '{}',
    mfa_enabled INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS organisations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    city TEXT,
    subscription TEXT DEFAULT 'FREE',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    project_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    client_id TEXT NOT NULL,
    designer_id TEXT,
    org_id TEXT,
    property_type TEXT DEFAULT 'APARTMENT',
    status TEXT DEFAULT 'INQUIRY',
    address TEXT,
    city TEXT,
    total_area_sqft REAL,
    budget REAL,
    description TEXT,
    scene_data TEXT DEFAULT '{}',
    ai_design_data TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (client_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'OTHER',
    status TEXT DEFAULT 'TODO',
    priority TEXT DEFAULT 'MEDIUM',
    assignee_id TEXT,
    creator_id TEXT NOT NULL,
    due_date TEXT,
    position INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );

  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    city TEXT,
    space TEXT,
    budget_range TEXT,
    message TEXT,
    status TEXT DEFAULT 'NEW',
    source TEXT DEFAULT 'website',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  -- ── TRACKING SYSTEM TABLES ──────────────────────────────────────

  CREATE TABLE IF NOT EXISTS project_timeline (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    updated_by TEXT,
    location TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS employee_attendance (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    date TEXT NOT NULL,
    login_time TEXT,
    logout_time TEXT,
    login_lat REAL,
    login_lng REAL,
    status TEXT DEFAULT 'PRESENT',
    tasks_completed INTEGER DEFAULT 0,
    productivity_score INTEGER DEFAULT 0,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS employee_locations (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    accuracy REAL DEFAULT 10,
    activity TEXT DEFAULT 'SITE_VISIT',
    project_id TEXT,
    timestamp TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS design_tasks (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    designer TEXT NOT NULL,
    task_type TEXT DEFAULT 'INITIAL_DESIGN',
    status TEXT DEFAULT 'PENDING',
    revision_count INTEGER DEFAULT 0,
    client_meetings INTEGER DEFAULT 0,
    due_date TEXT,
    completed_date TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS materials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity REAL DEFAULT 0,
    unit TEXT DEFAULT 'pcs',
    location TEXT DEFAULT 'WAREHOUSE',
    project_id TEXT,
    status TEXT DEFAULT 'ORDERED',
    vendor TEXT,
    unit_price REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS purchase_orders (
    id TEXT PRIMARY KEY,
    po_number TEXT UNIQUE NOT NULL,
    vendor TEXT NOT NULL,
    items TEXT DEFAULT '[]',
    total_amount REAL DEFAULT 0,
    status TEXT DEFAULT 'DRAFT',
    project_id TEXT,
    expected_date TEXT,
    received_date TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS factory_jobs (
    id TEXT PRIMARY KEY,
    job_number TEXT UNIQUE NOT NULL,
    project_id TEXT,
    item_name TEXT NOT NULL,
    category TEXT DEFAULT 'MODULAR',
    stage TEXT DEFAULT 'DESIGN_APPROVED',
    assigned_to TEXT,
    start_date TEXT,
    expected_date TEXT,
    actual_date TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS daily_reports (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    submitted_by TEXT NOT NULL,
    date TEXT NOT NULL,
    workers_count INTEGER DEFAULT 0,
    work_summary TEXT,
    issues TEXT,
    weather TEXT DEFAULT 'Clear',
    stage_progress TEXT DEFAULT '{}',
    photos_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
`)

// ── Tracking Seed Data ─────────────────────────────────────────────
const tlCount = db.prepare('SELECT COUNT(*) as c FROM project_timeline').get().c
if (tlCount === 0) {
  const pid = db.prepare('SELECT id FROM projects LIMIT 1').get()?.id
  if (pid) {
    const tl = db.prepare('INSERT INTO project_timeline (id,project_id,status,notes,updated_by) VALUES (?,?,?,?,?)')
    ;[
      ['Project enquiry received from client', 'CREATED'],
      ['Design kickoff meeting completed', 'DESIGN'],
      ['Quotation of ₹18,50,000 approved', 'QUOTATION_APPROVED'],
      ['Modular furniture production started', 'PRODUCTION'],
    ].forEach(([notes, status]) => tl.run(crypto.randomUUID(), pid, status, notes, 'System'))
  }

  // Seed employees attendance
  const att = db.prepare('INSERT INTO employee_attendance (id,employee_id,employee_name,date,login_time,logout_time,login_lat,login_lng,status,tasks_completed,productivity_score) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
  const today = new Date().toISOString().split('T')[0]
  att.run(crypto.randomUUID(),'emp1','Ravi Mohan',today,'09:02','—',13.0827,80.2707,'PRESENT',4,82)
  att.run(crypto.randomUUID(),'emp2','Anitha Selvam',today,'09:15','—',13.0878,80.2734,'PRESENT',3,75)
  att.run(crypto.randomUUID(),'emp3','Suresh Kumar',today,'—','—',0,0,'ABSENT',0,0)
  att.run(crypto.randomUUID(),'emp4','Kavitha Raj',today,'08:55','—',13.0812,80.2698,'PRESENT',6,91)
  att.run(crypto.randomUUID(),'emp5','Deepan Murugan',today,'09:30','—',13.0845,80.2715,'PRESENT',2,68)

  // Seed GPS locations
  const loc = db.prepare('INSERT INTO employee_locations (id,employee_id,employee_name,latitude,longitude,accuracy,activity,timestamp) VALUES (?,?,?,?,?,?,?,?)')
  const now = new Date().toISOString()
  loc.run(crypto.randomUUID(),'emp1','Ravi Mohan',13.0827,80.2707,8,'SITE_VISIT',now)
  loc.run(crypto.randomUUID(),'emp2','Anitha Selvam',13.0878,80.2734,12,'OFFICE',now)
  loc.run(crypto.randomUUID(),'emp4','Kavitha Raj',13.0812,80.2698,5,'INSTALLATION',now)
  loc.run(crypto.randomUUID(),'emp5','Deepan Murugan',13.0845,80.2715,10,'VENDOR_VISIT',now)

  // Seed materials
  const mat = db.prepare('INSERT INTO materials (id,name,category,quantity,unit,location,status,vendor,unit_price) VALUES (?,?,?,?,?,?,?,?,?)')
  mat.run(crypto.randomUUID(),'BWR Plywood 19mm','PLYWOOD',120,'sheets','WAREHOUSE','RECEIVED','Greenply Distributors',1850)
  mat.run(crypto.randomUUID(),'Vitrified Tiles 600x600','TILE',340,'sqft','SITE','INSTALLED','Asian Tiles',48)
  mat.run(crypto.randomUUID(),'Asian Paints Royale','PAINT',24,'litres','WAREHOUSE','RECEIVED','Asian Paints Store',340)
  mat.run(crypto.randomUUID(),'Hettich Hinges','HARDWARE',200,'pcs','WAREHOUSE','RECEIVED','Hardware Palace',28)
  mat.run(crypto.randomUUID(),'MDF 12mm Board','PLYWOOD',60,'sheets','IN_TRANSIT','IN_TRANSIT','National MDF',620)
  mat.run(crypto.randomUUID(),'Laminate Sheets','HARDWARE',80,'sheets','WAREHOUSE','ORDERED','Merino Laminates',420)

  // Seed purchase orders
  const po = db.prepare('INSERT INTO purchase_orders (id,po_number,vendor,items,total_amount,status,expected_date) VALUES (?,?,?,?,?,?,?)')
  po.run(crypto.randomUUID(),'PO-2025-001','Greenply Distributors','[{"name":"BWR Plywood 19mm","qty":120,"rate":1850}]',222000,'COMPLETE','2025-05-10')
  po.run(crypto.randomUUID(),'PO-2025-002','Asian Tiles','[{"name":"Vitrified Tiles 600x600","qty":340,"rate":48}]',16320,'COMPLETE','2025-05-15')
  po.run(crypto.randomUUID(),'PO-2025-003','National MDF','[{"name":"MDF 12mm Board","qty":60,"rate":620}]',37200,'PARTIAL_DELIVERY','2025-06-20')
  po.run(crypto.randomUUID(),'PO-2025-004','Merino Laminates','[{"name":"Laminate Sheets","qty":80,"rate":420}]',33600,'SENT','2025-06-25')

  // Seed factory jobs
  const fj = db.prepare('INSERT INTO factory_jobs (id,job_number,item_name,category,stage,assigned_to,start_date,expected_date) VALUES (?,?,?,?,?,?,?,?)')
  fj.run(crypto.randomUUID(),'FAB-001','Modular Kitchen — Mehta Villa','MODULAR','POLISHING','Ramesh S.','2025-06-01','2025-06-20')
  fj.run(crypto.randomUUID(),'FAB-002','Master Bedroom Wardrobe','MODULAR','ASSEMBLY','Kumar P.','2025-06-05','2025-06-22')
  fj.run(crypto.randomUUID(),'FAB-003','TV Unit — Living Room','MODULAR','CUTTING','Venkat R.','2025-06-10','2025-06-25')
  fj.run(crypto.randomUUID(),'FAB-004','Kids Room Study Table','MODULAR','DESIGN_APPROVED','Ramesh S.','2025-06-14','2025-06-30')

  // Seed daily reports
  const dr = db.prepare('INSERT INTO daily_reports (id,project_id,submitted_by,date,workers_count,work_summary,issues,weather,stage_progress,photos_count) VALUES (?,?,?,?,?,?,?,?,?,?)')
  if (pid) {
    dr.run(crypto.randomUUID(),pid,'Ravi Mohan',today,8,'Tile fixing completed in master bathroom. False ceiling frame installed in living room.','Granite countertop delivery delayed by 2 days.','Clear','{"kitchen":80,"wardrobe":60,"painting":20}',6)
  }
}

// Seed a demo admin if no users exist
const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c
if (userCount === 0) {
  const hash = bcrypt.hashSync('Admin@123', 10)
  db.prepare(`INSERT INTO users (id, email, password_hash, name, role) VALUES (?,?,?,?,?)`).run(
    crypto.randomUUID(), 'admin@elshaddai.in', hash, 'El Shaddai Admin', 'ADMIN'
  )
  const hash2 = bcrypt.hashSync('Client@123', 10)
  db.prepare(`INSERT INTO users (id, email, password_hash, name, role) VALUES (?,?,?,?,?)`).run(
    crypto.randomUUID(), 'client@elshaddai.in', hash2, 'Demo Client', 'CLIENT'
  )
  const hash3 = bcrypt.hashSync('Designer@123', 10)
  db.prepare(`INSERT INTO users (id, email, password_hash, name, role) VALUES (?,?,?,?,?)`).run(
    crypto.randomUUID(), 'designer@elshaddai.in', hash3, 'Priya Krishnaswamy', 'DESIGNER'
  )
  console.log('Seeded demo users: admin@elshaddai.in / Admin@123')
}

// ── Middleware ────────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }))
app.use(express.json())
app.use((req, _res, next) => { console.log(`${req.method} ${req.path}`); next() })

function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' })
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

function makeToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
}

function cuid() { return crypto.randomUUID() }

function projectNumber() {
  const count = db.prepare('SELECT COUNT(*) as c FROM projects').get().c
  return `ES-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`
}

// ── Auth Routes ───────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, role = 'CLIENT', city, organisation_name, years_experience, specialisation } = req.body
    if (!name || !email || !password) return res.status(400).json({ message: 'name, email and password are required' })
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' })

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (existing) return res.status(409).json({ message: 'Email already registered' })

    const password_hash = await bcrypt.hash(password, 12)
    const profile_data = JSON.stringify({ city, years_experience, specialisation })
    const id = cuid()

    // Create org if needed
    let org_id = null
    if (organisation_name && role !== 'CLIENT') {
      const slug = organisation_name.toLowerCase().replace(/[^a-z0-9]/g, '-')
      const existingOrg = db.prepare('SELECT id FROM organisations WHERE slug = ?').get(slug)
      if (existingOrg) {
        org_id = existingOrg.id
      } else {
        org_id = cuid()
        db.prepare('INSERT INTO organisations (id, name, slug, city) VALUES (?,?,?,?)').run(org_id, organisation_name, slug, city)
      }
    }

    db.prepare(`INSERT INTO users (id, email, password_hash, name, phone, role, org_id, profile_data) VALUES (?,?,?,?,?,?,?,?)`)
      .run(id, email, password_hash, name, phone || null, role, org_id, profile_data)

    const user = db.prepare('SELECT id, name, email, role, org_id, phone, created_at FROM users WHERE id = ?').get(id)
    const access_token = makeToken(user)
    res.status(201).json({ user, access_token })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ message: err.message })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (!user || !user.password_hash) return res.status(401).json({ message: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' })
    if (!user.is_active) return res.status(403).json({ message: 'Account deactivated' })

    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role, org_id: user.org_id, phone: user.phone }
    const access_token = makeToken(safeUser)
    res.json({ user: safeUser, access_token })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.get('/api/auth/me', auth, (req, res) => {
  const user = db.prepare('SELECT id, name, email, role, org_id, phone, avatar, created_at FROM users WHERE id = ?').get(req.user.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json(user)
})

// ── Projects Routes ───────────────────────────────────────────────

app.get('/api/projects', auth, (req, res) => {
  let rows
  if (['ADMIN', 'SUPER_ADMIN', 'DESIGNER'].includes(req.user.role)) {
    rows = db.prepare(`SELECT p.*, u.name as client_name, u.email as client_email FROM projects p LEFT JOIN users u ON p.client_id = u.id ORDER BY p.created_at DESC`).all()
  } else {
    rows = db.prepare(`SELECT p.*, u.name as client_name, u.email as client_email FROM projects p LEFT JOIN users u ON p.client_id = u.id WHERE p.client_id = ? OR p.designer_id = ? ORDER BY p.created_at DESC`).all(req.user.id, req.user.id)
  }
  res.json({ data: rows, total: rows.length })
})

app.get('/api/projects/:id', auth, (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id)
  if (!project) return res.status(404).json({ message: 'Project not found' })
  res.json(project)
})

app.post('/api/projects', auth, (req, res) => {
  try {
    const { name, property_type = 'APARTMENT', address, city, total_area_sqft, budget, description, client_id } = req.body
    if (!name) return res.status(400).json({ message: 'Project name is required' })

    const id = cuid()
    const clientId = client_id || req.user.id
    db.prepare(`INSERT INTO projects (id, project_number, name, client_id, designer_id, property_type, address, city, total_area_sqft, budget, description, org_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id, projectNumber(), name, clientId, req.user.role === 'DESIGNER' ? req.user.id : null, property_type, address || null, city || null, total_area_sqft || null, budget || null, description || null, req.user.org_id || null)

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id)
    res.status(201).json(project)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.patch('/api/projects/:id', auth, (req, res) => {
  const { name, status, description, city, total_area_sqft, budget, address, scene_data, ai_design_data } = req.body
  const fields = []
  const vals = []
  if (name !== undefined)           { fields.push('name = ?');            vals.push(name) }
  if (status !== undefined)         { fields.push('status = ?');          vals.push(status) }
  if (description !== undefined)    { fields.push('description = ?');     vals.push(description) }
  if (city !== undefined)           { fields.push('city = ?');            vals.push(city) }
  if (total_area_sqft !== undefined){ fields.push('total_area_sqft = ?'); vals.push(total_area_sqft) }
  if (budget !== undefined)         { fields.push('budget = ?');          vals.push(budget) }
  if (address !== undefined)        { fields.push('address = ?');         vals.push(address) }
  if (scene_data !== undefined)     { fields.push('scene_data = ?');      vals.push(JSON.stringify(scene_data)) }
  if (ai_design_data !== undefined) { fields.push('ai_design_data = ?'); vals.push(JSON.stringify(ai_design_data)) }

  if (!fields.length) return res.status(400).json({ message: 'No fields to update' })
  fields.push("updated_at = datetime('now')")
  vals.push(req.params.id)
  db.prepare(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`).run(...vals)
  res.json(db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id))
})

app.delete('/api/projects/:id', auth, (req, res) => {
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id)
  res.status(204).end()
})

// ── Tasks Routes ──────────────────────────────────────────────────

app.get('/api/projects/:projectId/tasks', auth, (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks WHERE project_id = ? ORDER BY position, created_at').all(req.params.projectId)
  res.json({ data: tasks, total: tasks.length })
})

app.post('/api/projects/:projectId/tasks', auth, (req, res) => {
  const { title, type = 'OTHER', status = 'TODO', priority = 'MEDIUM', assignee_id, due_date, description } = req.body
  if (!title) return res.status(400).json({ message: 'Title required' })
  const id = cuid()
  db.prepare(`INSERT INTO tasks (id, project_id, title, description, type, status, priority, assignee_id, creator_id, due_date) VALUES (?,?,?,?,?,?,?,?,?,?)`)
    .run(id, req.params.projectId, title, description || null, type, status, priority, assignee_id || null, req.user.id, due_date || null)
  res.status(201).json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(id))
})

app.patch('/api/tasks/:id', auth, (req, res) => {
  const { title, status, priority, assignee_id, due_date } = req.body
  const fields = []; const vals = []
  if (title !== undefined)       { fields.push('title = ?');       vals.push(title) }
  if (status !== undefined)      { fields.push('status = ?');      vals.push(status) }
  if (priority !== undefined)    { fields.push('priority = ?');    vals.push(priority) }
  if (assignee_id !== undefined) { fields.push('assignee_id = ?'); vals.push(assignee_id) }
  if (due_date !== undefined)    { fields.push('due_date = ?');    vals.push(due_date) }
  if (!fields.length) return res.status(400).json({ message: 'No fields to update' })
  fields.push("updated_at = datetime('now')")
  vals.push(req.params.id)
  db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`).run(...vals)
  res.json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id))
})

app.delete('/api/tasks/:id', auth, (req, res) => {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id)
  res.status(204).end()
})

// ── Leads Routes ──────────────────────────────────────────────────

app.get('/api/leads', auth, (req, res) => {
  const rows = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all()
  res.json({ data: rows, total: rows.length })
})

app.post('/api/leads', (req, res) => {
  const { name, email, phone, city, space, budget_range, message, source = 'website' } = req.body
  if (!name || !phone) return res.status(400).json({ message: 'name and phone required' })
  const id = cuid()
  db.prepare(`INSERT INTO leads (id, name, email, phone, city, space, budget_range, message, source) VALUES (?,?,?,?,?,?,?,?,?)`)
    .run(id, name, email || null, phone, city || null, space || null, budget_range || null, message || null, source)
  res.status(201).json(db.prepare('SELECT * FROM leads WHERE id = ?').get(id))
})

app.patch('/api/leads/:id', auth, (req, res) => {
  const { status } = req.body
  db.prepare(`UPDATE leads SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, req.params.id)
  res.json(db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id))
})

// ── Admin Routes ──────────────────────────────────────────────────

app.get('/api/admin/stats', auth, (req, res) => {
  const totalProjects  = db.prepare('SELECT COUNT(*) as c FROM projects').get().c
  const activeUsers    = db.prepare('SELECT COUNT(*) as c FROM users WHERE is_active = 1').get().c
  const openLeads      = db.prepare("SELECT COUNT(*) as c FROM leads WHERE status NOT IN ('WON','LOST')").get().c
  const recentProjects = db.prepare("SELECT * FROM projects ORDER BY created_at DESC LIMIT 5").all()
  res.json({ totalProjects, activeUsers, openLeads, recentProjects })
})

app.get('/api/admin/users', auth, (req, res) => {
  const users = db.prepare('SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC').all()
  res.json({ data: users, total: users.length })
})

// ── Tracking Routes ───────────────────────────────────────────────

// Project Timeline
app.get('/api/tracking/project-timeline/:projectId', auth, (req, res) => {
  const rows = db.prepare('SELECT * FROM project_timeline WHERE project_id = ? ORDER BY created_at DESC').all(req.params.projectId)
  res.json({ data: rows })
})
app.post('/api/tracking/project-timeline', auth, (req, res) => {
  const { project_id, status, notes, location } = req.body
  const id = cuid()
  db.prepare(`INSERT INTO project_timeline (id, project_id, status, notes, updated_by, location) VALUES (?,?,?,?,?,?)`)
    .run(id, project_id, status, notes || null, req.user.name || req.user.email, location || null)
  db.prepare(`UPDATE projects SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, project_id)
  res.status(201).json(db.prepare('SELECT * FROM project_timeline WHERE id = ?').get(id))
})

// Employee Attendance
app.get('/api/tracking/attendance', auth, (req, res) => {
  const rows = db.prepare('SELECT * FROM employee_attendance ORDER BY date DESC LIMIT 100').all()
  res.json({ data: rows })
})
app.post('/api/tracking/attendance', auth, (req, res) => {
  const { employee_id, employee_name, date, login_time, logout_time, location_lat, location_lng, status, productivity_score } = req.body
  const id = cuid()
  db.prepare(`INSERT INTO employee_attendance (id, employee_id, employee_name, date, login_time, logout_time, location_lat, location_lng, status, productivity_score) VALUES (?,?,?,?,?,?,?,?,?,?)`)
    .run(id, employee_id || req.user.id, employee_name || req.user.name, date || new Date().toISOString().slice(0,10), login_time || new Date().toISOString(), logout_time || null, location_lat || null, location_lng || null, status || 'PRESENT', productivity_score || null)
  res.status(201).json(db.prepare('SELECT * FROM employee_attendance WHERE id = ?').get(id))
})

// GPS Locations
app.get('/api/tracking/locations', auth, (req, res) => {
  const rows = db.prepare('SELECT * FROM employee_locations ORDER BY timestamp DESC LIMIT 50').all()
  res.json({ data: rows })
})
app.post('/api/tracking/locations', auth, (req, res) => {
  const { employee_id, employee_name, latitude, longitude, accuracy, activity } = req.body
  const id = cuid()
  db.prepare(`INSERT INTO employee_locations (id, employee_id, employee_name, latitude, longitude, accuracy, activity) VALUES (?,?,?,?,?,?,?)`)
    .run(id, employee_id || req.user.id, employee_name || req.user.name, latitude, longitude, accuracy || null, activity || 'WORKING')
  res.status(201).json(db.prepare('SELECT * FROM employee_locations WHERE id = ?').get(id))
})

// Materials
app.get('/api/tracking/materials', auth, (req, res) => {
  const rows = db.prepare('SELECT * FROM materials ORDER BY created_at DESC').all()
  res.json({ data: rows })
})
app.patch('/api/tracking/materials/:id', auth, (req, res) => {
  const { status, quantity_available, location } = req.body
  const fields = []; const vals = []
  if (status !== undefined)             { fields.push('status = ?');             vals.push(status) }
  if (quantity_available !== undefined) { fields.push('quantity_available = ?'); vals.push(quantity_available) }
  if (location !== undefined)           { fields.push('location = ?');           vals.push(location) }
  if (!fields.length) return res.status(400).json({ message: 'No fields' })
  fields.push("updated_at = datetime('now')"); vals.push(req.params.id)
  db.prepare(`UPDATE materials SET ${fields.join(', ')} WHERE id = ?`).run(...vals)
  res.json(db.prepare('SELECT * FROM materials WHERE id = ?').get(req.params.id))
})

// Purchase Orders
app.get('/api/tracking/purchase-orders', auth, (req, res) => {
  const rows = db.prepare('SELECT * FROM purchase_orders ORDER BY created_at DESC').all()
  res.json({ data: rows })
})
app.post('/api/tracking/purchase-orders', auth, (req, res) => {
  const { po_number, vendor_name, vendor_contact, items, total_amount, expected_delivery, project_id } = req.body
  const id = cuid()
  db.prepare(`INSERT INTO purchase_orders (id, po_number, vendor_name, vendor_contact, items, total_amount, expected_delivery, project_id) VALUES (?,?,?,?,?,?,?,?)`)
    .run(id, po_number, vendor_name, vendor_contact || null, JSON.stringify(items || []), total_amount || 0, expected_delivery || null, project_id || null)
  res.status(201).json(db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(id))
})
app.patch('/api/tracking/purchase-orders/:id', auth, (req, res) => {
  const { status, received_date } = req.body
  const fields = []; const vals = []
  if (status !== undefined)        { fields.push('status = ?');        vals.push(status) }
  if (received_date !== undefined) { fields.push('received_date = ?'); vals.push(received_date) }
  if (!fields.length) return res.status(400).json({ message: 'No fields' })
  fields.push("updated_at = datetime('now')"); vals.push(req.params.id)
  db.prepare(`UPDATE purchase_orders SET ${fields.join(', ')} WHERE id = ?`).run(...vals)
  res.json(db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(req.params.id))
})

// Factory Jobs
app.get('/api/tracking/factory-jobs', auth, (req, res) => {
  const rows = db.prepare('SELECT * FROM factory_jobs ORDER BY created_at DESC').all()
  res.json({ data: rows })
})
app.patch('/api/tracking/factory-jobs/:id', auth, (req, res) => {
  const { stage, quality_check_passed, notes } = req.body
  const fields = []; const vals = []
  if (stage !== undefined)                { fields.push('stage = ?');                vals.push(stage) }
  if (quality_check_passed !== undefined) { fields.push('quality_check_passed = ?'); vals.push(quality_check_passed) }
  if (notes !== undefined)                { fields.push('notes = ?');                vals.push(notes) }
  if (!fields.length) return res.status(400).json({ message: 'No fields' })
  fields.push("updated_at = datetime('now')"); vals.push(req.params.id)
  db.prepare(`UPDATE factory_jobs SET ${fields.join(', ')} WHERE id = ?`).run(...vals)
  res.json(db.prepare('SELECT * FROM factory_jobs WHERE id = ?').get(req.params.id))
})

// Daily Reports
app.get('/api/tracking/daily-reports', auth, (req, res) => {
  const rows = db.prepare('SELECT * FROM daily_reports ORDER BY report_date DESC LIMIT 50').all()
  res.json({ data: rows })
})
app.post('/api/tracking/daily-reports', auth, (req, res) => {
  const { project_id, contractor_name, report_date, work_done, workers_count, issues, stage_progress, photos_count } = req.body
  const id = cuid()
  db.prepare(`INSERT INTO daily_reports (id, project_id, contractor_name, report_date, work_done, workers_count, issues, stage_progress, photos_count) VALUES (?,?,?,?,?,?,?,?,?)`)
    .run(id, project_id, contractor_name || req.user.name, report_date || new Date().toISOString().slice(0,10), work_done || '', workers_count || 0, issues || null, JSON.stringify(stage_progress || {}), photos_count || 0)
  res.status(201).json(db.prepare('SELECT * FROM daily_reports WHERE id = ?').get(id))
})

// Design Tasks
app.get('/api/tracking/design-tasks', auth, (req, res) => {
  const rows = db.prepare('SELECT * FROM design_tasks ORDER BY deadline ASC').all()
  res.json({ data: rows })
})
app.patch('/api/tracking/design-tasks/:id', auth, (req, res) => {
  const { status, revision_count, client_meetings } = req.body
  const fields = []; const vals = []
  if (status !== undefined)         { fields.push('status = ?');         vals.push(status) }
  if (revision_count !== undefined) { fields.push('revision_count = ?'); vals.push(revision_count) }
  if (client_meetings !== undefined){ fields.push('client_meetings = ?');vals.push(client_meetings) }
  if (!fields.length) return res.status(400).json({ message: 'No fields' })
  fields.push("updated_at = datetime('now')"); vals.push(req.params.id)
  db.prepare(`UPDATE design_tasks SET ${fields.join(', ')} WHERE id = ?`).run(...vals)
  res.json(db.prepare('SELECT * FROM design_tasks WHERE id = ?').get(req.params.id))
})

// ── Google OAuth ──────────────────────────────────────────────────
// Receives Google's credential JWT, decodes it, finds/creates user, returns our JWT
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential, role = 'CLIENT' } = req.body
    if (!credential) return res.status(400).json({ message: 'Google credential required' })

    // Decode the Google JWT (base64 payload — no library needed)
    const parts = credential.split('.')
    if (parts.length !== 3) return res.status(400).json({ message: 'Invalid Google credential' })
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))

    const { email, name, picture, sub: googleId, email_verified } = payload
    if (!email) return res.status(400).json({ message: 'No email in Google token' })
    if (!email_verified) return res.status(400).json({ message: 'Google email not verified' })

    // Find existing user or create new one
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)

    if (!user) {
      // New user — register with Google
      const validRoles = ['CLIENT','DESIGNER','BUILDER','WORKSHOP_WORKER','ADMIN','SUPER_ADMIN']
      const userRole = validRoles.includes(role) ? role : 'CLIENT'
      const id = cuid()
      db.prepare(`INSERT INTO users (id, email, name, avatar, role, password_hash, is_active) VALUES (?,?,?,?,?,?,1)`)
        .run(id, email, name, picture || null, userRole, '')
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
      console.log(`Google signup: ${email} as ${userRole}`)
    } else {
      // Update avatar from Google if not set
      if (!user.avatar && picture) {
        db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(picture, user.id)
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id)
      }
    }

    if (!user.is_active) return res.status(403).json({ message: 'Account deactivated' })

    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role, org_id: user.org_id, phone: user.phone, avatar: user.avatar }
    const access_token = makeToken(safeUser)
    res.json({ user: safeUser, access_token })
  } catch (err) {
    console.error('Google auth error:', err)
    res.status(500).json({ message: err.message })
  }
})

// ── Health ────────────────────────────────────────────────────────

app.get('/api', (_req, res) => res.json({ status: 'ok', version: '1.0.0-lite', db: 'sqlite' }))
app.get('/api/health', (_req, res) => res.json({ status: 'healthy' }))

// ── Start ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  El Shaddai Lite API → http://localhost:${PORT}/api`)
  console.log(`📦  Database          → ${DB_PATH}`)
  console.log(`\n🔑  Demo accounts:`)
  console.log(`    admin@elshaddai.in    / Admin@123     (ADMIN)`)
  console.log(`    designer@elshaddai.in / Designer@123  (DESIGNER)`)
  console.log(`    client@elshaddai.in   / Client@123    (CLIENT)\n`)
})
