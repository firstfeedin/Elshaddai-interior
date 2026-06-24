require('dotenv').config()
const express    = require('express')
const cors       = require('cors')
const bcrypt     = require('bcryptjs')
const jwt        = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const db         = require('./db')

const app = express()
const JWT_SECRET = process.env.JWT_SECRET || 'elshaddai-super-secret-jwt-2026'
const PORT = process.env.PORT || 3001

const ALLOWED_ORIGINS = [
  'http://localhost:5173','http://localhost:5174','http://localhost:4173',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),
]
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin) || /\.vercel\.app$/.test(origin)) return cb(null, true)
    cb(new Error('CORS'))
  },
  credentials: true,
}))
app.use(express.json())

// ── Auth middleware ───────────────────────────────────────────
function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' })
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET)
    next()
  } catch { res.status(401).json({ error: 'Invalid token' }) }
}

const TEAM_ROLES = ['PM_UX','FRONTEND_LEAD','FRONTEND_UI','BACKEND_ENG','DEVOPS','QA_ENGINEER']

function adminOnly(req, res, next) {
  if (!['ADMIN','SUPER_ADMIN',...TEAM_ROLES].includes(req.user?.role)) return res.status(403).json({ error: 'Forbidden' })
  next()
}

function makeToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' })
}

// ── Health check (Railway / Render / uptime monitors) ─────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

// ── REGISTER ─────────────────────────────────────────────────
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone, role, city, organisation_name, years_experience, specialisation } = req.body
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })

  const validRoles = ['CLIENT','DESIGNER','BUILDER','WORKSHOP_WORKER','ADMIN','SUPER_ADMIN','PM_UX','FRONTEND_LEAD','FRONTEND_UI','BACKEND_ENG','DEVOPS','QA_ENGINEER']
  const userRole = validRoles.includes(role) ? role : 'CLIENT'

  try {
    const existing = db.prepare('SELECT id FROM users WHERE email=?').get(email)
    if (existing) return res.status(409).json({ error: 'Email already registered' })

    const hash = bcrypt.hashSync(password, 10)
    const result = db.prepare(`
      INSERT INTO users (name,email,password_hash,phone,role,city,organisation_name,years_experience,specialisation)
      VALUES (?,?,?,?,?,?,?,?,?)
    `).run(name, email.toLowerCase(), hash, phone||null, userRole, city||null, organisation_name||null, years_experience||null, specialisation||null)

    const user = db.prepare('SELECT id,name,email,role,phone,city,organisation_name,created_at FROM users WHERE id=?').get(result.lastInsertRowid)

    // Log
    db.prepare('INSERT INTO audit_log (user_id,action,entity_type,entity_id,ip_address) VALUES (?,?,?,?,?)').run(user.id,'REGISTER','USER',user.id,req.ip)

    res.status(201).json({ access_token: makeToken(user), user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── LOGIN ─────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  const user = db.prepare('SELECT * FROM users WHERE email=? AND is_active=1').get(email.toLowerCase())
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  db.prepare("UPDATE users SET updated_at=datetime('now') WHERE id=?").run(user.id)
  db.prepare('INSERT INTO audit_log (user_id,action,entity_type,ip_address) VALUES (?,?,?,?)').run(user.id,'LOGIN','SESSION',req.ip)

  const { password_hash, ...safeUser } = user
  res.json({ access_token: makeToken(safeUser), user: safeUser })
})

// ── ME ────────────────────────────────────────────────────────
app.get('/api/auth/me', auth, (req, res) => {
  const user = db.prepare('SELECT id,name,email,role,phone,city,organisation_name,years_experience,specialisation,created_at FROM users WHERE id=?').get(req.user.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json(user)
})

// ── GOOGLE OAUTH ──────────────────────────────────────────────
app.post('/api/auth/google', (req, res) => {
  const { credential, role = 'CLIENT' } = req.body
  if (!credential) return res.status(400).json({ error: 'No credential provided' })

  try {
    const parts   = credential.split('.')
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))
    const { email, name, picture, email_verified } = payload

    if (!email_verified) return res.status(400).json({ error: 'Google email not verified' })

    const validRoles = ['CLIENT','DESIGNER','BUILDER','WORKSHOP_WORKER','ADMIN','SUPER_ADMIN','PM_UX','FRONTEND_LEAD','FRONTEND_UI','BACKEND_ENG','DEVOPS','QA_ENGINEER']
    const userRole = validRoles.includes(role) ? role : 'CLIENT'

    let user = db.prepare('SELECT id,name,email,role,phone,city,organisation_name,created_at FROM users WHERE email=?').get(email.toLowerCase())

    if (!user) {
      const result = db.prepare(`
        INSERT INTO users (name,email,password_hash,role,is_active)
        VALUES (?,?,?,?,1)
      `).run(name, email.toLowerCase(), '', userRole)
      user = db.prepare('SELECT id,name,email,role,phone,city,organisation_name,created_at FROM users WHERE id=?').get(result.lastInsertRowid)
    }

    res.json({ access_token: makeToken(user), user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── UPDATE PROFILE ────────────────────────────────────────────
app.put('/api/auth/profile', auth, (req, res) => {
  const { name, phone, city, organisation_name, years_experience, specialisation } = req.body
  db.prepare(`UPDATE users SET name=?,phone=?,city=?,organisation_name=?,years_experience=?,specialisation=?,updated_at=datetime('now') WHERE id=?`)
    .run(name, phone||null, city||null, organisation_name||null, years_experience||null, specialisation||null, req.user.id)
  const user = db.prepare('SELECT id,name,email,role,phone,city,organisation_name,years_experience,specialisation FROM users WHERE id=?').get(req.user.id)
  res.json(user)
})

// ── CHANGE PASSWORD ───────────────────────────────────────────
app.put('/api/auth/change-password', auth, (req, res) => {
  const { current_password, new_password } = req.body
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(req.user.id)
  if (!bcrypt.compareSync(current_password, user.password_hash)) return res.status(400).json({ error: 'Current password is incorrect' })
  if (new_password.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' })
  db.prepare("UPDATE users SET password_hash=?,updated_at=datetime('now') WHERE id=?").run(bcrypt.hashSync(new_password,10), req.user.id)
  res.json({ message: 'Password changed successfully' })
})

// ── USERS (admin) ─────────────────────────────────────────────
app.get('/api/users', auth, adminOnly, (req, res) => {
  const users = db.prepare('SELECT id,name,email,role,phone,city,organisation_name,is_active,created_at FROM users ORDER BY created_at DESC').all()
  res.json(users)
})

app.put('/api/users/:id/toggle', auth, adminOnly, (req, res) => {
  db.prepare('UPDATE users SET is_active=CASE WHEN is_active=1 THEN 0 ELSE 1 END WHERE id=?').run(req.params.id)
  res.json({ message: 'Updated' })
})

// ── PROJECTS ─────────────────────────────────────────────────
app.get('/api/projects', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all())
})

app.post('/api/projects', auth, (req, res) => {
  const { project_number,name,client_name,status,budget,city,start_date,expected_end,progress_pct,notes } = req.body
  const r = db.prepare(`INSERT INTO projects (project_number,name,client_name,status,budget,city,start_date,expected_end,progress_pct,notes) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(project_number,name,client_name,status||'CREATED',budget||0,city,start_date,expected_end,progress_pct||0,notes)
  res.status(201).json(db.prepare('SELECT * FROM projects WHERE id=?').get(r.lastInsertRowid))
})

app.get('/api/projects/:id', auth, (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id=?').get(req.params.id)
  if (!project) return res.status(404).json({ error: 'Project not found' })
  res.json(project)
})

app.delete('/api/projects/:id', auth, adminOnly, (req, res) => {
  db.prepare('DELETE FROM tasks WHERE project_id=?').run(req.params.id)
  db.prepare('DELETE FROM projects WHERE id=?').run(req.params.id)
  res.json({ ok: true })
})

app.put('/api/projects/:id', auth, (req, res) => {
  const { name,client_name,status,budget,city,start_date,expected_end,progress_pct,notes } = req.body
  db.prepare(`UPDATE projects SET name=?,client_name=?,status=?,budget=?,city=?,start_date=?,expected_end=?,progress_pct=?,notes=?,updated_at=datetime('now') WHERE id=?`).run(name,client_name,status,budget,city,start_date,expected_end,progress_pct,notes,req.params.id)
  res.json(db.prepare('SELECT * FROM projects WHERE id=?').get(req.params.id))
})

// ── PROJECT TIMELINE ─────────────────────────────────────────
app.get('/api/projects/:id/timeline', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM project_timeline WHERE project_id=? ORDER BY created_at DESC').all(req.params.id))
})

app.post('/api/tracking/project-timeline', auth, (req, res) => {
  const { project_id, status, notes } = req.body
  const r = db.prepare('INSERT INTO project_timeline (project_id,status,notes,updated_by) VALUES (?,?,?,?)').run(project_id,status,notes,req.user.name)
  if (status) db.prepare("UPDATE projects SET status=?,updated_at=datetime('now') WHERE id=?").run(status,project_id)
  res.status(201).json({ id: r.lastInsertRowid })
})

// ── EMPLOYEES ────────────────────────────────────────────────
app.get('/api/employees', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM employees ORDER BY name').all())
})

app.post('/api/employees', auth, adminOnly, (req, res) => {
  const { name,role,department,phone,email,salary,join_date } = req.body
  const r = db.prepare('INSERT INTO employees (name,role,department,phone,email,salary,join_date) VALUES (?,?,?,?,?,?,?)').run(name,role,department,phone,email,salary,join_date)
  res.status(201).json(db.prepare('SELECT * FROM employees WHERE id=?').get(r.lastInsertRowid))
})

// ── ATTENDANCE ────────────────────────────────────────────────
app.get('/api/attendance', auth, (req, res) => {
  const { date } = req.query
  const where = date ? 'WHERE a.date=?' : ''
  const rows = db.prepare(`SELECT a.*,e.name as employee_name,e.role as employee_role FROM attendance a JOIN employees e ON e.id=a.employee_id ${where} ORDER BY e.name`).all(...(date?[date]:[]))
  res.json(rows)
})

app.post('/api/attendance', auth, (req, res) => {
  const { employee_id,date,login_time,logout_time,status,productivity_score,notes } = req.body
  const r = db.prepare('INSERT OR REPLACE INTO attendance (employee_id,date,login_time,logout_time,status,productivity_score,notes) VALUES (?,?,?,?,?,?,?)').run(employee_id,date,login_time,logout_time,status||'PRESENT',productivity_score,notes)
  res.status(201).json({ id: r.lastInsertRowid })
})

// ── TASKS ─────────────────────────────────────────────────────
app.get('/api/tasks', auth, (req, res) => {
  const rows = db.prepare(`SELECT t.*,p.name as project_name,e.name as assignee_name FROM tasks t LEFT JOIN projects p ON p.id=t.project_id LEFT JOIN employees e ON e.id=t.assigned_to ORDER BY t.created_at DESC`).all()
  res.json(rows)
})

app.post('/api/tasks', auth, (req, res) => {
  const { project_id,assigned_to,title,description,status,priority,due_date } = req.body
  const r = db.prepare('INSERT INTO tasks (project_id,assigned_to,title,description,status,priority,due_date,created_by) VALUES (?,?,?,?,?,?,?,?)').run(project_id,assigned_to,title,description,status||'PENDING',priority||'NORMAL',due_date,req.user.id)
  res.status(201).json(db.prepare('SELECT * FROM tasks WHERE id=?').get(r.lastInsertRowid))
})

app.delete('/api/tasks/:id', auth, (req, res) => {
  db.prepare('DELETE FROM tasks WHERE id=?').run(req.params.id)
  res.json({ ok: true })
})

app.put('/api/tasks/:id', auth, (req, res) => {
  const { status,priority,title,description,due_date } = req.body
  const completed_at = status === 'COMPLETED' ? "datetime('now')" : 'NULL'
  db.prepare(`UPDATE tasks SET status=?,priority=?,title=?,description=?,due_date=?,completed_at=${completed_at},updated_at=datetime('now') WHERE id=?`).run(status,priority,title,description,due_date,req.params.id)
  res.json(db.prepare('SELECT * FROM tasks WHERE id=?').get(req.params.id))
})

// ── NOTIFICATIONS ─────────────────────────────────────────────
app.get('/api/notifications', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 50').all(req.user.id))
})

app.put('/api/notifications/:id/read', auth, (req, res) => {
  db.prepare('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?').run(req.params.id, req.user.id)
  res.json({ ok: true })
})

app.put('/api/notifications/read-all', auth, (req, res) => {
  db.prepare('UPDATE notifications SET is_read=1 WHERE user_id=?').run(req.user.id)
  res.json({ ok: true })
})

// ── VENDORS ───────────────────────────────────────────────────
app.get('/api/vendors', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM vendors WHERE is_active=1 ORDER BY name').all())
})

app.post('/api/vendors', auth, adminOnly, (req, res) => {
  const { name,category,contact_name,phone,email,city,rating,on_time_pct,gstin } = req.body
  const r = db.prepare('INSERT INTO vendors (name,category,contact_name,phone,email,city,rating,on_time_pct,gstin) VALUES (?,?,?,?,?,?,?,?,?)').run(name,category,contact_name,phone,email,city,rating||0,on_time_pct||100,gstin)
  res.status(201).json(db.prepare('SELECT * FROM vendors WHERE id=?').get(r.lastInsertRowid))
})

// ── PURCHASE ORDERS ───────────────────────────────────────────
app.get('/api/purchase-orders', auth, (req, res) => {
  const rows = db.prepare(`SELECT po.*,v.name as vendor_name,p.name as project_name FROM purchase_orders po LEFT JOIN vendors v ON v.id=po.vendor_id LEFT JOIN projects p ON p.id=po.project_id ORDER BY po.created_at DESC`).all()
  res.json(rows)
})

app.post('/api/purchase-orders', auth, (req, res) => {
  const { po_number,vendor_id,project_id,items,total_amount,status,expected_delivery,notes } = req.body
  const r = db.prepare('INSERT INTO purchase_orders (po_number,vendor_id,project_id,items,total_amount,status,expected_delivery,notes,created_by) VALUES (?,?,?,?,?,?,?,?,?)').run(po_number,vendor_id,project_id,JSON.stringify(items||[]),total_amount||0,status||'PENDING',expected_delivery,notes,req.user.id)
  res.status(201).json(db.prepare('SELECT * FROM purchase_orders WHERE id=?').get(r.lastInsertRowid))
})

app.put('/api/purchase-orders/:id/status', auth, (req, res) => {
  db.prepare("UPDATE purchase_orders SET status=?,updated_at=datetime('now') WHERE id=?").run(req.body.status, req.params.id)
  res.json({ ok: true })
})

// ── MATERIALS ─────────────────────────────────────────────────
app.get('/api/materials', auth, (req, res) => {
  const { project_id } = req.query
  const where = project_id ? 'WHERE m.project_id=?' : ''
  const rows = db.prepare(`SELECT m.*,v.name as vendor_name,p.name as project_name FROM materials m LEFT JOIN vendors v ON v.id=m.vendor_id LEFT JOIN projects p ON p.id=m.project_id ${where} ORDER BY m.name`).all(...(project_id?[project_id]:[]))
  res.json(rows)
})

app.post('/api/materials', auth, (req, res) => {
  const { project_id,name,category,brand,quantity_ordered,quantity_available,unit,unit_price,vendor_id,status,location,area,notes } = req.body
  const r = db.prepare('INSERT INTO materials (project_id,name,category,brand,quantity_ordered,quantity_available,unit,unit_price,vendor_id,status,location,area,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').run(project_id,name,category,brand,quantity_ordered||0,quantity_available||0,unit,unit_price||0,vendor_id,status||'SPECIFIED',location,area,notes)
  res.status(201).json(db.prepare('SELECT * FROM materials WHERE id=?').get(r.lastInsertRowid))
})

app.put('/api/materials/:id/status', auth, (req, res) => {
  db.prepare("UPDATE materials SET status=?,updated_at=datetime('now') WHERE id=?").run(req.body.status, req.params.id)
  res.json({ ok: true })
})

// ── FACTORY JOBS ──────────────────────────────────────────────
app.get('/api/factory-jobs', auth, (req, res) => {
  const rows = db.prepare(`SELECT f.*,p.name as project_name FROM factory_jobs f LEFT JOIN projects p ON p.id=f.project_id ORDER BY f.created_at DESC`).all()
  res.json(rows)
})

app.put('/api/factory-jobs/:id/stage', auth, (req, res) => {
  db.prepare("UPDATE factory_jobs SET stage=?,updated_at=datetime('now') WHERE id=?").run(req.body.stage, req.params.id)
  res.json({ ok: true })
})

// ── CONTRACTS ─────────────────────────────────────────────────
app.get('/api/contracts', auth, (req, res) => {
  const rows = db.prepare(`SELECT c.*,p.name as project_name FROM contracts c LEFT JOIN projects p ON p.id=c.project_id ORDER BY c.created_at DESC`).all()
  res.json(rows)
})

app.post('/api/contracts', auth, (req, res) => {
  const { project_id,title,status,total_value,terms } = req.body
  const r = db.prepare('INSERT INTO contracts (project_id,title,status,total_value,terms) VALUES (?,?,?,?,?)').run(project_id,title,status||'DRAFT',total_value||0,terms)
  res.status(201).json(db.prepare('SELECT * FROM contracts WHERE id=?').get(r.lastInsertRowid))
})

app.put('/api/contracts/:id', auth, (req, res) => {
  const { status, title, total_value, terms } = req.body
  db.prepare("UPDATE contracts SET status=?,title=COALESCE(?,title),total_value=COALESCE(?,total_value),terms=COALESCE(?,terms),updated_at=datetime('now') WHERE id=?").run(status, title||null, total_value||null, terms||null, req.params.id)
  res.json(db.prepare('SELECT * FROM contracts WHERE id=?').get(req.params.id))
})

app.put('/api/contracts/:id/sign', auth, (req, res) => {
  db.prepare("UPDATE contracts SET status='SIGNED',signed_at=datetime('now'),signed_by=?,signature_ip=?,updated_at=datetime('now') WHERE id=?").run(req.body.signed_by||'Client',req.ip,req.params.id)
  res.json({ ok: true })
})

// ── DOCUMENTS ─────────────────────────────────────────────────
app.get('/api/documents', auth, (req, res) => {
  const { project_id } = req.query
  const where = project_id ? 'WHERE d.project_id=?' : ''
  const rows = db.prepare(`SELECT d.*,p.name as project_name,u.name as uploaded_by_name FROM documents d LEFT JOIN projects p ON p.id=d.project_id LEFT JOIN users u ON u.id=d.uploaded_by ${where} ORDER BY d.created_at DESC`).all(...(project_id?[project_id]:[]))
  res.json(rows)
})

app.post('/api/documents', auth, (req, res) => {
  const { project_id,name,category,file_type,file_size,file_url,tag,description } = req.body
  const r = db.prepare('INSERT INTO documents (project_id,uploaded_by,name,category,file_type,file_size,file_url,tag,description) VALUES (?,?,?,?,?,?,?,?,?)').run(project_id,req.user.id,name,category,file_type,file_size,file_url,tag,description)
  res.status(201).json(db.prepare('SELECT * FROM documents WHERE id=?').get(r.lastInsertRowid))
})

// ── TIMESHEETS ────────────────────────────────────────────────
app.get('/api/timesheets', auth, (req, res) => {
  const { week_start } = req.query
  const where = week_start ? 'WHERE t.week_start=?' : ''
  const rows = db.prepare(`SELECT t.*,e.name as employee_name,e.role as employee_role,p.name as project_name FROM timesheets t JOIN employees e ON e.id=t.employee_id LEFT JOIN projects p ON p.id=t.project_id ${where} ORDER BY e.name`).all(...(week_start?[week_start]:[]))
  res.json(rows)
})

app.post('/api/timesheets', auth, (req, res) => {
  const { employee_id,project_id,week_start,mon_hrs,tue_hrs,wed_hrs,thu_hrs,fri_hrs,sat_hrs,notes } = req.body
  const r = db.prepare('INSERT OR REPLACE INTO timesheets (employee_id,project_id,week_start,mon_hrs,tue_hrs,wed_hrs,thu_hrs,fri_hrs,sat_hrs,notes) VALUES (?,?,?,?,?,?,?,?,?,?)').run(employee_id,project_id,week_start,mon_hrs||0,tue_hrs||0,wed_hrs||0,thu_hrs||0,fri_hrs||0,sat_hrs||0,notes)
  res.status(201).json({ id: r.lastInsertRowid })
})

app.put('/api/timesheets/:id/approve', auth, adminOnly, (req, res) => {
  db.prepare("UPDATE timesheets SET status='APPROVED',approved_by=?,approved_at=datetime('now') WHERE id=?").run(req.user.id, req.params.id)
  res.json({ ok: true })
})

// ── QC CHECKLISTS ─────────────────────────────────────────────
app.get('/api/qc-checklists/:project_id', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM qc_checklists WHERE project_id=? ORDER BY phase,created_at').all(req.params.project_id))
})

app.put('/api/qc-checklists/:id', auth, (req, res) => {
  db.prepare("UPDATE qc_checklists SET status=?,notes=?,checked_at=datetime('now') WHERE id=?").run(req.body.status,req.body.notes,req.params.id)
  res.json({ ok: true })
})

// ── SITE DIARY ────────────────────────────────────────────────
app.get('/api/site-diary', auth, (req, res) => {
  const { project_id } = req.query
  const where = project_id ? 'WHERE s.project_id=?' : ''
  const rows = db.prepare(`SELECT s.*,p.name as project_name,e.name as reporter_name FROM site_diary s LEFT JOIN projects p ON p.id=s.project_id LEFT JOIN employees e ON e.id=s.reported_by ${where} ORDER BY s.report_date DESC`).all(...(project_id?[project_id]:[]))
  res.json(rows)
})

app.post('/api/site-diary', auth, (req, res) => {
  const { project_id,reported_by,report_date,work_done,workers_count,issues,materials_used,weather } = req.body
  const r = db.prepare('INSERT INTO site_diary (project_id,reported_by,report_date,work_done,workers_count,issues,materials_used,weather) VALUES (?,?,?,?,?,?,?,?)').run(project_id,reported_by,report_date,work_done,workers_count||0,issues,materials_used,weather)
  res.status(201).json({ id: r.lastInsertRowid })
})

// ── CALENDAR ──────────────────────────────────────────────────
app.get('/api/calendar', auth, (req, res) => {
  const rows = db.prepare(`SELECT c.*,p.name as project_name FROM calendar_events c LEFT JOIN projects p ON p.id=c.project_id ORDER BY c.start_dt`).all()
  res.json(rows)
})

app.post('/api/calendar', auth, (req, res) => {
  const { project_id,title,type,start_dt,end_dt,location,notes,attendees } = req.body
  const r = db.prepare('INSERT INTO calendar_events (project_id,created_by,title,type,start_dt,end_dt,location,notes,attendees) VALUES (?,?,?,?,?,?,?,?,?)').run(project_id,req.user.id,title,type||'MEETING',start_dt,end_dt,location,notes,JSON.stringify(attendees||[]))
  res.status(201).json(db.prepare('SELECT * FROM calendar_events WHERE id=?').get(r.lastInsertRowid))
})

// ── AUDIT LOG ─────────────────────────────────────────────────
app.get('/api/audit-log', auth, adminOnly, (req, res) => {
  const rows = db.prepare(`SELECT a.*,u.name as user_name,u.email as user_email FROM audit_log a LEFT JOIN users u ON u.id=a.user_id ORDER BY a.created_at DESC LIMIT 200`).all()
  res.json(rows)
})

// ── QUOTES ────────────────────────────────────────────────────
app.get('/api/quotes', auth, (req, res) => {
  const rows = db.prepare(`SELECT q.*,p.name as project_name FROM quotes q LEFT JOIN projects p ON p.id=q.project_id ORDER BY q.created_at DESC`).all()
  res.json(rows)
})

app.post('/api/quotes', auth, (req, res) => {
  const { project_id,quote_number,client_id,items,subtotal,tax_pct,discount,total,status,valid_until,notes } = req.body
  const r = db.prepare('INSERT INTO quotes (project_id,quote_number,client_id,items,subtotal,tax_pct,discount,total,status,valid_until,notes,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').run(project_id,quote_number,client_id,JSON.stringify(items||[]),subtotal||0,tax_pct||18,discount||0,total||0,status||'DRAFT',valid_until,notes,req.user.id)
  res.status(201).json(db.prepare('SELECT * FROM quotes WHERE id=?').get(r.lastInsertRowid))
})

// ── GPS ───────────────────────────────────────────────────────
app.get('/api/gps', auth, (req, res) => {
  const rows = db.prepare(`SELECT g.*,e.name as employee_name,p.name as project_name FROM gps_logs g LEFT JOIN employees e ON e.id=g.employee_id LEFT JOIN projects p ON p.id=g.project_id ORDER BY g.timestamp DESC LIMIT 100`).all()
  res.json(rows)
})

app.post('/api/gps', auth, (req, res) => {
  const { employee_id,latitude,longitude,activity,project_id } = req.body
  const r = db.prepare('INSERT INTO gps_logs (employee_id,latitude,longitude,activity,project_id) VALUES (?,?,?,?,?)').run(employee_id,latitude,longitude,activity||'WORKING',project_id)
  res.status(201).json({ id: r.lastInsertRowid })
})

// ── ADMIN ALIASES (for frontend api.js compatibility) ────────
app.get('/api/admin/stats', auth, adminOnly, (req, res) => {
  const today = new Date().toISOString().slice(0,10)
  res.json({
    projects: db.prepare("SELECT COUNT(*) as c FROM projects").get().c,
    users:    db.prepare("SELECT COUNT(*) as c FROM users WHERE is_active=1").get().c,
    leads:    db.prepare("SELECT COUNT(*) as c FROM leads WHERE status NOT IN ('WON','LOST')").get().c || 0,
    revenue:  db.prepare("SELECT SUM(budget) as s FROM projects").get().s || 0,
  })
})

app.get('/api/admin/users', auth, adminOnly, (req, res) => {
  const users = db.prepare('SELECT id,name,email,role,phone,city,organisation_name,is_active,created_at FROM users ORDER BY created_at DESC').all()
  res.json(users)
})

// ── PROJECT TASKS (by project) ────────────────────────────────
app.get('/api/projects/:id/tasks', auth, (req, res) => {
  const rows = db.prepare('SELECT * FROM tasks WHERE project_id=? ORDER BY created_at DESC').all(req.params.id)
  res.json(rows)
})

app.post('/api/projects/:id/tasks', auth, (req, res) => {
  const { title,description,status,priority,due_date,assigned_to } = req.body
  const r = db.prepare('INSERT INTO tasks (project_id,assigned_to,title,description,status,priority,due_date,created_by) VALUES (?,?,?,?,?,?,?,?)').run(req.params.id,assigned_to,title,description,status||'PENDING',priority||'NORMAL',due_date,req.user.id)
  res.status(201).json(db.prepare('SELECT * FROM tasks WHERE id=?').get(r.lastInsertRowid))
})

// ── LEADS ─────────────────────────────────────────────────────
app.get('/api/leads', auth, (req, res) => {
  let rows
  try { rows = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all() }
  catch { rows = [] }
  res.json(rows)
})

app.post('/api/leads', (req, res) => {
  const { name,email,phone,city,space_type,budget_range,message } = req.body
  try {
    const r = db.prepare('INSERT INTO leads (name,email,phone,city,space_type,budget_range,message,status) VALUES (?,?,?,?,?,?,?,?)').run(name,email,phone,city,space_type,budget_range,message,'NEW')
    res.status(201).json({ id: r.lastInsertRowid, message: 'Lead created' })
  } catch {
    res.status(201).json({ message: 'Enquiry received' })
  }
})

app.patch('/api/leads/:id', auth, adminOnly, (req, res) => {
  const { status } = req.body
  try { db.prepare("UPDATE leads SET status=? WHERE id=?").run(status, req.params.id) }
  catch {}
  res.json({ ok: true })
})

// ── DASHBOARD SUMMARY ────────────────────────────────────────
app.get('/api/dashboard/summary', auth, (req, res) => {
  const today = new Date().toISOString().slice(0,10)
  res.json({
    projects:       db.prepare("SELECT COUNT(*) as c FROM projects").get().c,
    active_projects:db.prepare("SELECT COUNT(*) as c FROM projects WHERE status NOT IN ('COMPLETED','CREATED')").get().c,
    on_site_today:  db.prepare("SELECT COUNT(*) as c FROM attendance WHERE date=? AND status IN ('PRESENT','LATE')").get(today).c,
    pending_pos:    db.prepare("SELECT COUNT(*) as c FROM purchase_orders WHERE status NOT IN ('DELIVERED','CANCELLED')").get().c,
    factory_active: db.prepare("SELECT COUNT(*) as c FROM factory_jobs WHERE stage!='DISPATCHED'").get().c,
    total_portfolio:db.prepare("SELECT SUM(budget) as s FROM projects").get().s || 0,
    employees:      db.prepare("SELECT COUNT(*) as c FROM employees WHERE status='ACTIVE'").get().c,
    open_tasks:     db.prepare("SELECT COUNT(*) as c FROM tasks WHERE status NOT IN ('COMPLETED')").get().c,
  })
})

// ── Contact form ─────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body
  if (!name || !email || !message) return res.status(400).json({ error: 'Name, email and message are required' })

  // Always save to DB first — message is never lost even if email fails
  const row = db.prepare(
    'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)'
  ).run(name, email, message)

  const TO   = process.env.CONTACT_TO   || 'contactus@divinemercyitsol.com'
  const USER = process.env.SMTP_USER
  const PASS = process.env.SMTP_PASS

  if (!USER || !PASS) {
    // Credentials not configured yet — message saved to DB, respond OK
    console.warn('⚠️  SMTP not configured. Message saved to DB (id=' + row.lastInsertRowid + ')')
    return res.json({ ok: true, note: 'saved' })
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: USER, pass: PASS },
  })

  try {
    await transporter.sendMail({
      from: `"El Shaddai Website" <${USER}>`,
      to: TO,
      replyTo: email,
      subject: `New enquiry from ${name} — El Shaddai`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 32px;background:#f5ede8;border-top:4px solid #c4956a;">
          <h2 style="font-family:Georgia,serif;font-weight:300;color:#2a0e14;margin:0 0 8px;font-size:28px;">New Contact Enquiry</h2>
          <p style="color:#9a8a82;font-size:12px;margin:0 0 32px;">Received via elshaddai.in contact form</p>
          <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid rgba(0,0,0,0.07);">
            <tr>
              <td style="padding:14px 20px;border-bottom:1px solid #f0ebe6;color:#9a8a82;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;width:100px;">Name</td>
              <td style="padding:14px 20px;border-bottom:1px solid #f0ebe6;color:#2e2e2c;font-size:14px;">${name}</td>
            </tr>
            <tr>
              <td style="padding:14px 20px;border-bottom:1px solid #f0ebe6;color:#9a8a82;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;">Email</td>
              <td style="padding:14px 20px;border-bottom:1px solid #f0ebe6;font-size:14px;"><a href="mailto:${email}" style="color:#c4956a;text-decoration:none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding:14px 20px;color:#9a8a82;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;vertical-align:top;">Message</td>
              <td style="padding:14px 20px;color:#2e2e2c;font-size:14px;line-height:1.8;">${message.replace(/\n/g,'<br/>')}</td>
            </tr>
          </table>
          <div style="margin-top:24px;padding:16px 20px;background:#2a0e14;display:inline-block;">
            <a href="mailto:${email}" style="color:#c4956a;font-size:12px;font-weight:600;text-decoration:none;letter-spacing:0.1em;text-transform:uppercase;">Reply to ${name} →</a>
          </div>
        </div>
      `,
    })
    // Mark email as sent in DB
    db.prepare('UPDATE contact_messages SET email_sent=1 WHERE id=?').run(row.lastInsertRowid)
    res.json({ ok: true })
  } catch (err) {
    console.error('Contact mail error:', err.message)
    // Message already in DB — still respond OK to user, log the failure
    res.json({ ok: true, note: 'saved' })
  }
})

// ── View contact messages (admin) ─────────────────────────────
app.get('/api/contact-messages', auth, adminOnly, (req, res) => {
  const msgs = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 100').all()
  res.json(msgs)
})

// ═══════════════════════════════════════════════════════════════
//  SCENE / STUDIO PROJECT CRUD
// ═══════════════════════════════════════════════════════════════

// Ensure scenes table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS scenes (
    id          TEXT PRIMARY KEY,
    user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT    NOT NULL DEFAULT 'Untitled Project',
    scene_json  TEXT    NOT NULL,
    thumbnail   TEXT,
    is_public   INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_scenes_user ON scenes(user_id);
`)

// List user's scenes
app.get('/api/scenes', auth, (req, res) => {
  const scenes = db.prepare(
    `SELECT id, name, thumbnail, is_public, created_at, updated_at
     FROM scenes WHERE user_id=? ORDER BY updated_at DESC LIMIT 50`
  ).all(req.user.id)
  res.json(scenes)
})

// Get a single scene (owner or public)
app.get('/api/scenes/:id', auth, (req, res) => {
  const scene = db.prepare('SELECT * FROM scenes WHERE id=?').get(req.params.id)
  if (!scene) return res.status(404).json({ error: 'Scene not found' })
  if (scene.user_id !== req.user.id && !scene.is_public) {
    return res.status(403).json({ error: 'Access denied' })
  }
  res.json({ ...scene, scene_json: JSON.parse(scene.scene_json) })
})

// Create scene
app.post('/api/scenes', auth, (req, res) => {
  const { id, name, scene_json } = req.body
  if (!id || !scene_json) return res.status(400).json({ error: 'id and scene_json required' })
  try {
    const json = typeof scene_json === 'string' ? scene_json : JSON.stringify(scene_json)
    db.prepare(
      `INSERT INTO scenes (id, user_id, name, scene_json) VALUES (?,?,?,?)`
    ).run(id, req.user.id, name || 'Untitled Project', json)
    res.status(201).json({ id, name })
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Scene already exists' })
    res.status(500).json({ error: e.message })
  }
})

// Update scene (upsert)
app.put('/api/scenes/:id', auth, (req, res) => {
  const { name, scene_json, thumbnail } = req.body
  const existing = db.prepare('SELECT user_id FROM scenes WHERE id=?').get(req.params.id)
  if (existing && existing.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' })
  }
  const json = typeof scene_json === 'string' ? scene_json : JSON.stringify(scene_json)
  if (!existing) {
    db.prepare(
      `INSERT INTO scenes (id,user_id,name,scene_json,thumbnail) VALUES (?,?,?,?,?)`
    ).run(req.params.id, req.user.id, name ?? 'Untitled Project', json, thumbnail ?? null)
  } else {
    db.prepare(
      `UPDATE scenes SET name=COALESCE(?,name), scene_json=?, thumbnail=COALESCE(?,thumbnail), updated_at=datetime('now') WHERE id=?`
    ).run(name ?? null, json, thumbnail ?? null, req.params.id)
  }
  res.json({ ok: true })
})

// Delete scene
app.delete('/api/scenes/:id', auth, (req, res) => {
  const existing = db.prepare('SELECT user_id FROM scenes WHERE id=?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Not found' })
  if (existing.user_id !== req.user.id) return res.status(403).json({ error: 'Access denied' })
  db.prepare('DELETE FROM scenes WHERE id=?').run(req.params.id)
  res.json({ ok: true })
})

// Duplicate scene
app.post('/api/scenes/:id/duplicate', auth, (req, res) => {
  const src = db.prepare('SELECT * FROM scenes WHERE id=?').get(req.params.id)
  if (!src) return res.status(404).json({ error: 'Not found' })
  if (src.user_id !== req.user.id && !src.is_public) return res.status(403).json({ error: 'Access denied' })
  const newId   = require('crypto').randomUUID()
  const newName = `${src.name} (copy)`
  // Update the id in the scene JSON too
  let json = src.scene_json
  try { const obj = JSON.parse(json); obj.id = newId; json = JSON.stringify(obj) } catch {}
  db.prepare(
    `INSERT INTO scenes (id,user_id,name,scene_json) VALUES (?,?,?,?)`
  ).run(newId, req.user.id, newName, json)
  res.status(201).json({ id: newId, name: newName })
})

// ═══════════════════════════════════════════════════════════════
//  RENDER JOB QUEUE
//  Phase 2: swap the in-memory queue for BullMQ + Redis
//           and point workers at a Blender GPU instance.
// ═══════════════════════════════════════════════════════════════

// Ensure render_jobs table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS render_jobs (
    id           TEXT PRIMARY KEY,
    user_id      INTEGER REFERENCES users(id),
    scene_id     TEXT,
    status       TEXT NOT NULL DEFAULT 'queued',
    resolution   TEXT NOT NULL DEFAULT '1920x1080',
    samples      INTEGER NOT NULL DEFAULT 128,
    format       TEXT NOT NULL DEFAULT 'png',
    type         TEXT NOT NULL DEFAULT 'still',
    result_url   TEXT,
    error        TEXT,
    credits_used INTEGER NOT NULL DEFAULT 1,
    queued_at    TEXT NOT NULL DEFAULT (datetime('now')),
    started_at   TEXT,
    finished_at  TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_render_jobs_user ON render_jobs(user_id);
`)

// Render credits per resolution
const RENDER_CREDITS = { '1280x720': 1, '1920x1080': 2, '2560x1440': 4, '3840x2160': 8, '8192x4096': 16 }

// Submit a render job
app.post('/api/render/jobs', auth, (req, res) => {
  const { sceneId, resolution = '1920x1080', samples = 128, format = 'png', type = 'still' } = req.body
  if (!sceneId) return res.status(400).json({ error: 'sceneId required' })

  const credits = RENDER_CREDITS[resolution] ?? 2

  // TODO Phase 3: check user render credit balance
  const jobId = require('crypto').randomUUID()
  db.prepare(
    `INSERT INTO render_jobs (id,user_id,scene_id,status,resolution,samples,format,type,credits_used)
     VALUES (?,?,?,?,?,?,?,?,?)`
  ).run(jobId, req.user.id, sceneId, 'queued', resolution, samples, format, type, credits)

  // Simulate async processing (replace with real Blender worker call in Phase 2)
  const estSeconds = { '1280x720': 15, '1920x1080': 30, '2560x1440': 90, '3840x2160': 240 }[resolution] ?? 60
  simulateRender(jobId, estSeconds)

  res.status(201).json({ id: jobId, status: 'queued', estimatedSeconds: estSeconds, creditsUsed: credits })
})

// Get job status
app.get('/api/render/jobs/:id', auth, (req, res) => {
  const job = db.prepare('SELECT * FROM render_jobs WHERE id=?').get(req.params.id)
  if (!job) return res.status(404).json({ error: 'Job not found' })
  if (job.user_id !== req.user.id) return res.status(403).json({ error: 'Access denied' })
  res.json(job)
})

// List user's render jobs
app.get('/api/render/jobs', auth, (req, res) => {
  const jobs = db.prepare(
    `SELECT id,scene_id,status,resolution,type,result_url,credits_used,queued_at,finished_at
     FROM render_jobs WHERE user_id=? ORDER BY queued_at DESC LIMIT 20`
  ).all(req.user.id)
  res.json(jobs)
})

// Cancel a queued job
app.delete('/api/render/jobs/:id', auth, (req, res) => {
  const job = db.prepare('SELECT * FROM render_jobs WHERE id=?').get(req.params.id)
  if (!job) return res.status(404).json({ error: 'Not found' })
  if (job.user_id !== req.user.id) return res.status(403).json({ error: 'Access denied' })
  if (job.status !== 'queued') return res.status(409).json({ error: `Cannot cancel job in state: ${job.status}` })
  db.prepare(`UPDATE render_jobs SET status='cancelled' WHERE id=?`).run(job.id)
  res.json({ ok: true })
})

/**
 * Simulates the render pipeline until a real Blender GPU worker is wired up.
 * In Phase 2: replace this with a call to the BullMQ job queue which dispatches
 * to a Blender headless container (glTF → Cycles → PNG → CDN upload → webhook).
 */
function simulateRender(jobId, estSeconds) {
  // queued → rendering after 2s
  setTimeout(() => {
    db.prepare(`UPDATE render_jobs SET status='rendering', started_at=datetime('now') WHERE id=?`).run(jobId)
  }, 2000)

  // rendering → done after estSeconds (placeholder: use a fixed preview image)
  setTimeout(() => {
    const placeholderUrl = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&q=80'
    db.prepare(
      `UPDATE render_jobs SET status='done', result_url=?, finished_at=datetime('now') WHERE id=?`
    ).run(placeholderUrl, jobId)
  }, Math.min(estSeconds * 1000, 8000)) // cap demo at 8s
}

// ═══════════════════════════════════════════════════════════════
//  CATALOG API  (serves furniture catalog to the frontend)
// ═══════════════════════════════════════════════════════════════

// Static catalog endpoint — Phase 4: replace with DB-backed catalog + CDN assets
app.get('/api/catalog', (req, res) => {
  const { category, q, limit = 50 } = req.query
  // The actual catalog data lives in src/data/furnitureCatalog.js (client bundle).
  // This endpoint exists for future server-side catalog with 1M+ items.
  // For now, return a minimal stub so the frontend API can be wired early.
  res.json({
    total: 0,
    items: [],
    message: 'Full catalog served from client bundle. Server catalog available in Phase 4.',
  })
})

// ── START ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏠 El Shaddai API running on http://localhost:${PORT}`)
  console.log(`   Auth:      POST /api/auth/register  |  POST /api/auth/login`)
  console.log(`   Scenes:    GET/POST/PUT/DELETE /api/scenes`)
  console.log(`   Render:    POST /api/render/jobs  |  GET /api/render/jobs/:id`)
  console.log(`   Catalog:   GET  /api/catalog\n`)
})
