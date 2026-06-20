const express    = require('express')
const cors       = require('cors')
const bcrypt     = require('bcryptjs')
const jwt        = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const db         = require('./db')

const app = express()
const JWT_SECRET = process.env.JWT_SECRET || 'elshaddai-super-secret-jwt-2026'
const PORT = process.env.PORT || 3001

app.use(cors({ origin: ['http://localhost:5173','http://localhost:5174','http://localhost:4173'], credentials: true }))
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

function adminOnly(req, res, next) {
  if (!['ADMIN','SUPER_ADMIN'].includes(req.user?.role)) return res.status(403).json({ error: 'Forbidden' })
  next()
}

function makeToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' })
}

// ── REGISTER ─────────────────────────────────────────────────
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone, role, city, organisation_name, years_experience, specialisation } = req.body
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })

  const validRoles = ['CLIENT','DESIGNER','BUILDER','WORKSHOP_WORKER','ADMIN','SUPER_ADMIN']
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

    const validRoles = ['CLIENT','DESIGNER','BUILDER','WORKSHOP_WORKER','ADMIN','SUPER_ADMIN']
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

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER || 'contactus@divinemercyitsol.com',
      pass: process.env.SMTP_PASS || '',
    },
  })

  try {
    await transporter.sendMail({
      from: `"El Shaddai Contact" <${process.env.SMTP_USER || 'contactus@divinemercyitsol.com'}>`,
      to: 'contactus@divinemercyitsol.com',
      replyTo: email,
      subject: `New enquiry from ${name} — El Shaddai`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f5ede8;">
          <h2 style="font-family:Georgia,serif;font-weight:300;color:#2a0e14;margin:0 0 24px;">New Contact Enquiry</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:10px 0;border-bottom:1px solid rgba(0,0,0,0.08);color:#9a8a82;font-size:12px;width:120px;">Name</td><td style="padding:10px 0;border-bottom:1px solid rgba(0,0,0,0.08);color:#2e2e2c;font-size:14px;">${name}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid rgba(0,0,0,0.08);color:#9a8a82;font-size:12px;">Email</td><td style="padding:10px 0;border-bottom:1px solid rgba(0,0,0,0.08);color:#2e2e2c;font-size:14px;"><a href="mailto:${email}" style="color:#c4956a;">${email}</a></td></tr>
            <tr><td style="padding:10px 0;color:#9a8a82;font-size:12px;vertical-align:top;">Message</td><td style="padding:10px 0;color:#2e2e2c;font-size:14px;line-height:1.7;">${message.replace(/\n/g,'<br/>')}</td></tr>
          </table>
          <p style="margin:32px 0 0;font-size:11px;color:#9a8a82;">Sent from elshaddai.in contact form</p>
        </div>
      `,
    })
    res.json({ ok: true })
  } catch (err) {
    console.error('Contact mail error:', err.message)
    res.status(500).json({ error: 'Failed to send email. Please try again.' })
  }
})

// ── START ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏠 El Shaddai API running on http://localhost:${PORT}`)
  console.log(`   Auth:      POST /api/auth/register  |  POST /api/auth/login`)
  console.log(`   Dashboard: GET  /api/dashboard/summary`)
  console.log(`   Projects:  GET  /api/projects\n`)
})
