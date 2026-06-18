const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, 'elshaddai.sqlite'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    name              TEXT NOT NULL,
    email             TEXT NOT NULL UNIQUE,
    password_hash     TEXT NOT NULL,
    phone             TEXT,
    role              TEXT NOT NULL DEFAULT 'CLIENT',
    city              TEXT,
    organisation_name TEXT,
    years_experience  INTEGER,
    specialisation    TEXT,
    is_active         INTEGER NOT NULL DEFAULT 1,
    created_at        TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS projects (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    project_number TEXT NOT NULL UNIQUE,
    name           TEXT NOT NULL,
    client_id      INTEGER REFERENCES users(id),
    client_name    TEXT,
    designer_id    INTEGER REFERENCES users(id),
    status         TEXT NOT NULL DEFAULT 'CREATED',
    budget         REAL NOT NULL DEFAULT 0,
    city           TEXT,
    address        TEXT,
    start_date     TEXT,
    expected_end   TEXT,
    progress_pct   INTEGER NOT NULL DEFAULT 0,
    notes          TEXT,
    created_at     TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS project_timeline (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    status     TEXT NOT NULL,
    notes      TEXT,
    updated_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS employees (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER REFERENCES users(id),
    name       TEXT NOT NULL,
    role       TEXT NOT NULL,
    department TEXT,
    phone      TEXT,
    email      TEXT,
    salary     REAL,
    join_date  TEXT,
    status     TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id        INTEGER NOT NULL REFERENCES employees(id),
    date               TEXT NOT NULL,
    login_time         TEXT,
    logout_time        TEXT,
    status             TEXT NOT NULL DEFAULT 'PRESENT',
    productivity_score INTEGER,
    notes              TEXT,
    created_at         TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(employee_id, date)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id   INTEGER REFERENCES projects(id),
    assigned_to  INTEGER REFERENCES employees(id),
    title        TEXT NOT NULL,
    description  TEXT,
    status       TEXT NOT NULL DEFAULT 'PENDING',
    priority     TEXT NOT NULL DEFAULT 'NORMAL',
    due_date     TEXT,
    completed_at TEXT,
    created_by   INTEGER REFERENCES users(id),
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER REFERENCES users(id),
    type       TEXT NOT NULL DEFAULT 'INFO',
    title      TEXT NOT NULL,
    message    TEXT,
    priority   TEXT NOT NULL DEFAULT 'NORMAL',
    is_read    INTEGER NOT NULL DEFAULT 0,
    action_url TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS audit_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER REFERENCES users(id),
    action      TEXT NOT NULL,
    entity_type TEXT,
    entity_id   INTEGER,
    details     TEXT,
    ip_address  TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS documents (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id  INTEGER REFERENCES projects(id),
    uploaded_by INTEGER REFERENCES users(id),
    name        TEXT NOT NULL,
    category    TEXT,
    file_type   TEXT,
    file_size   INTEGER,
    file_url    TEXT,
    tag         TEXT,
    description TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contracts (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id   INTEGER REFERENCES projects(id),
    client_id    INTEGER REFERENCES users(id),
    title        TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'DRAFT',
    total_value  REAL NOT NULL DEFAULT 0,
    terms        TEXT,
    sent_at      TEXT,
    signed_at    TEXT,
    signed_by    TEXT,
    signature_ip TEXT,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contract_milestones (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id INTEGER NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    pct         INTEGER NOT NULL DEFAULT 0,
    amount      REAL NOT NULL DEFAULT 0,
    due_date    TEXT,
    paid_at     TEXT,
    status      TEXT NOT NULL DEFAULT 'PENDING'
  );

  CREATE TABLE IF NOT EXISTS vendors (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT NOT NULL,
    category     TEXT,
    contact_name TEXT,
    phone        TEXT,
    email        TEXT,
    city         TEXT,
    rating       REAL NOT NULL DEFAULT 0,
    on_time_pct  INTEGER NOT NULL DEFAULT 100,
    gstin        TEXT,
    is_active    INTEGER NOT NULL DEFAULT 1,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS purchase_orders (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    po_number         TEXT NOT NULL UNIQUE,
    vendor_id         INTEGER REFERENCES vendors(id),
    project_id        INTEGER REFERENCES projects(id),
    items             TEXT,
    total_amount      REAL NOT NULL DEFAULT 0,
    status            TEXT NOT NULL DEFAULT 'PENDING',
    expected_delivery TEXT,
    received_date     TEXT,
    notes             TEXT,
    created_by        INTEGER REFERENCES users(id),
    created_at        TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id  INTEGER REFERENCES vendors(id),
    po_id      INTEGER REFERENCES purchase_orders(id),
    invoice_no TEXT NOT NULL,
    amount     REAL NOT NULL DEFAULT 0,
    due_date   TEXT,
    paid_at    TEXT,
    status     TEXT NOT NULL DEFAULT 'PENDING',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS materials (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id         INTEGER REFERENCES projects(id),
    name               TEXT NOT NULL,
    category           TEXT,
    brand              TEXT,
    quantity_ordered   REAL NOT NULL DEFAULT 0,
    quantity_available REAL NOT NULL DEFAULT 0,
    unit               TEXT,
    unit_price         REAL NOT NULL DEFAULT 0,
    vendor_id          INTEGER REFERENCES vendors(id),
    status             TEXT NOT NULL DEFAULT 'SPECIFIED',
    location           TEXT,
    area               TEXT,
    notes              TEXT,
    created_at         TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS factory_jobs (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id           INTEGER REFERENCES projects(id),
    job_number           TEXT NOT NULL UNIQUE,
    item_type            TEXT NOT NULL,
    description          TEXT,
    stage                TEXT NOT NULL DEFAULT 'DESIGN_APPROVED',
    assigned_to          TEXT,
    quality_check_passed INTEGER NOT NULL DEFAULT 0,
    notes                TEXT,
    started_at           TEXT,
    completed_at         TEXT,
    created_at           TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at           TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS timesheets (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employees(id),
    project_id  INTEGER REFERENCES projects(id),
    week_start  TEXT NOT NULL,
    mon_hrs     REAL NOT NULL DEFAULT 0,
    tue_hrs     REAL NOT NULL DEFAULT 0,
    wed_hrs     REAL NOT NULL DEFAULT 0,
    thu_hrs     REAL NOT NULL DEFAULT 0,
    fri_hrs     REAL NOT NULL DEFAULT 0,
    sat_hrs     REAL NOT NULL DEFAULT 0,
    notes       TEXT,
    status      TEXT NOT NULL DEFAULT 'DRAFT',
    approved_by INTEGER REFERENCES users(id),
    approved_at TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(employee_id, project_id, week_start)
  );

  CREATE TABLE IF NOT EXISTS qc_checklists (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id  INTEGER NOT NULL REFERENCES projects(id),
    phase       TEXT NOT NULL,
    item        TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'PENDING',
    checked_by  INTEGER REFERENCES employees(id),
    checked_at  TEXT,
    notes       TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS site_diary (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id     INTEGER NOT NULL REFERENCES projects(id),
    reported_by    INTEGER REFERENCES employees(id),
    report_date    TEXT NOT NULL,
    work_done      TEXT,
    workers_count  INTEGER NOT NULL DEFAULT 0,
    issues         TEXT,
    materials_used TEXT,
    weather        TEXT,
    created_at     TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS calendar_events (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER REFERENCES projects(id),
    created_by INTEGER REFERENCES users(id),
    title      TEXT NOT NULL,
    type       TEXT NOT NULL DEFAULT 'MEETING',
    start_dt   TEXT NOT NULL,
    end_dt     TEXT,
    location   TEXT,
    notes      TEXT,
    attendees  TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS gps_logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER REFERENCES employees(id),
    latitude    REAL,
    longitude   REAL,
    activity    TEXT NOT NULL DEFAULT 'WORKING',
    project_id  INTEGER REFERENCES projects(id),
    timestamp   TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS quotes (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id   INTEGER REFERENCES projects(id),
    quote_number TEXT NOT NULL UNIQUE,
    client_id    INTEGER REFERENCES users(id),
    items        TEXT,
    subtotal     REAL NOT NULL DEFAULT 0,
    tax_pct      REAL NOT NULL DEFAULT 18,
    discount     REAL NOT NULL DEFAULT 0,
    total        REAL NOT NULL DEFAULT 0,
    status       TEXT NOT NULL DEFAULT 'DRAFT',
    valid_until  TEXT,
    notes        TEXT,
    created_by   INTEGER REFERENCES users(id),
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)

module.exports = db
