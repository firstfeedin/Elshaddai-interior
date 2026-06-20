// Central API client — proxied through Vite in dev, served directly in prod
const BASE = import.meta.env.VITE_API_URL || '/api'

function getToken() {
  return localStorage.getItem('es_token')
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.message || `Request failed: ${res.status}`)
  }

  return data
}

// ── Auth ─────────────────────────────────────────────────────────

export const auth = {
  async register(payload) {
    const data = await request('POST', '/auth/register', payload)
    if (data.access_token) {
      localStorage.setItem('es_token', data.access_token)
      localStorage.setItem('es_user', JSON.stringify(data.user))
    }
    return data
  },

  async login(email, password) {
    const data = await request('POST', '/auth/login', { email, password })
    if (data.access_token) {
      localStorage.setItem('es_token', data.access_token)
      localStorage.setItem('es_user', JSON.stringify(data.user))
    }
    return data
  },

  async me() {
    return request('GET', '/auth/me')
  },

  logout() {
    localStorage.removeItem('es_token')
    localStorage.removeItem('es_user')
    window.location.href = '/'
  },

  getUser() {
    try {
      const u = localStorage.getItem('es_user')
      return u ? JSON.parse(u) : null
    } catch {
      return null
    }
  },

  isLoggedIn() {
    return !!getToken()
  },
}

// ── Projects ─────────────────────────────────────────────────────

export const projects = {
  list()          { return request('GET',    '/projects') },
  get(id)         { return request('GET',    `/projects/${id}`) },
  create(payload) { return request('POST',   '/projects', payload) },
  update(id, payload) { return request('PUT',   `/projects/${id}`, payload) },
  delete(id)      { return request('DELETE', `/projects/${id}`) },
}

// ── Tasks ─────────────────────────────────────────────────────────

export const tasks = {
  listAll()               { return request('GET',    '/tasks') },
  list(projectId)         { return request('GET',    `/projects/${projectId}/tasks`) },
  create(payload)         { return request('POST',   '/tasks', payload) },
  update(taskId, payload) { return request('PUT',    `/tasks/${taskId}`, payload) },
  delete(taskId)          { return request('DELETE', `/tasks/${taskId}`) },
}

// ── Leads ─────────────────────────────────────────────────────────

export const leads = {
  list()          { return request('GET',  '/leads') },
  create(payload) { return request('POST', '/leads', payload) },
  update(id, payload) { return request('PATCH', `/leads/${id}`, payload) },
}

// ── Admin ─────────────────────────────────────────────────────────

export const admin = {
  stats()           { return request('GET', '/admin/stats') },
  users()           { return request('GET', '/admin/users') },
  auditLog()        { return request('GET', '/audit-log') },
  toggleUser(id)    { return request('PUT', `/users/${id}/toggle`) },
}

// ── Employees ──────────────────────────────────────────────────────

export const employees = {
  list()            { return request('GET',  '/employees') },
  create(payload)   { return request('POST', '/employees', payload) },
}

// ── Attendance ─────────────────────────────────────────────────────

export const attendance = {
  list(date)        { return request('GET',  `/attendance${date ? `?date=${date}` : ''}`) },
  create(payload)   { return request('POST', '/attendance', payload) },
}

// ── Vendors ────────────────────────────────────────────────────────

export const vendors = {
  list()            { return request('GET',  '/vendors') },
  create(payload)   { return request('POST', '/vendors', payload) },
}

// ── Purchase Orders ────────────────────────────────────────────────

export const purchaseOrders = {
  list()                   { return request('GET',  '/purchase-orders') },
  create(payload)          { return request('POST', '/purchase-orders', payload) },
  updateStatus(id, status) { return request('PUT',  `/purchase-orders/${id}/status`, { status }) },
}

// ── Materials ──────────────────────────────────────────────────────

export const materials = {
  list(projectId)          { return request('GET',  `/materials${projectId ? `?project_id=${projectId}` : ''}`) },
  create(payload)          { return request('POST', '/materials', payload) },
  updateStatus(id, status) { return request('PUT',  `/materials/${id}/status`, { status }) },
}

// ── Factory Jobs ───────────────────────────────────────────────────

export const factoryJobs = {
  list()                   { return request('GET', '/factory-jobs') },
  updateStage(id, stage)   { return request('PUT', `/factory-jobs/${id}/stage`, { stage }) },
}

// ── Site Diary ─────────────────────────────────────────────────────

export const siteDiary = {
  list(projectId)  { return request('GET',  `/site-diary${projectId ? `?project_id=${projectId}` : ''}`) },
  create(payload)  { return request('POST', '/site-diary', payload) },
}

// ── Calendar ───────────────────────────────────────────────────────

export const calendar = {
  list()           { return request('GET',  '/calendar') },
  create(payload)  { return request('POST', '/calendar', payload) },
}

// ── Notifications ──────────────────────────────────────────────────

export const notifications = {
  list()           { return request('GET', '/notifications') },
  markRead(id)     { return request('PUT', `/notifications/${id}/read`) },
  markAllRead()    { return request('PUT', '/notifications/read-all') },
}

// ── QC Checklists ──────────────────────────────────────────────────

export const qcChecklists = {
  list(projectId)        { return request('GET', `/qc-checklists/${projectId}`) },
  update(id, payload)    { return request('PUT', `/qc-checklists/${id}`, payload) },
}

// ── Timesheets ─────────────────────────────────────────────────────

export const timesheets = {
  list(employeeId)  { return request('GET',  `/timesheets${employeeId ? `?employee_id=${employeeId}` : ''}`) },
  create(payload)   { return request('POST', '/timesheets', payload) },
  approve(id)       { return request('PUT',  `/timesheets/${id}/approve`) },
}

// ── Contracts ──────────────────────────────────────────────────────

export const contracts = {
  list()               { return request('GET',  '/contracts') },
  create(payload)      { return request('POST', '/contracts', payload) },
  update(id, payload)  { return request('PUT',  `/contracts/${id}`, payload) },
  sign(id, payload)    { return request('PUT',  `/contracts/${id}/sign`, payload) },
}

// ── Documents ─────────────────────────────────────────────────────

export const documents = {
  list()           { return request('GET',  '/documents') },
  create(payload)  { return request('POST', '/documents', payload) },
}

// ── Quotes ─────────────────────────────────────────────────────────

export const quotes = {
  list()           { return request('GET',  '/quotes') },
  create(payload)  { return request('POST', '/quotes', payload) },
}

// ── Audit Log ──────────────────────────────────────────────────────

export const auditLog = {
  list()           { return request('GET', '/audit-log') },
}

// ── Dashboard Summary ──────────────────────────────────────────────

export const dashboard = {
  summary()        { return request('GET', '/dashboard/summary') },
}
