-- ============================================================
-- EL SHADDAI INTERIORS — SUPABASE SCHEMA
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- ── 1. PROFILES (extends Supabase auth.users) ─────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                UUID    PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name              TEXT    NOT NULL DEFAULT '',
  phone             TEXT,
  role              TEXT    NOT NULL DEFAULT 'CLIENT'
                    CHECK (role IN ('CLIENT','DESIGNER','BUILDER','WORKSHOP_WORKER','ADMIN','SUPER_ADMIN')),
  city              TEXT,
  organisation_name TEXT,
  years_experience  INTEGER,
  specialisation    TEXT,
  avatar_url        TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  mfa_enabled       BOOLEAN NOT NULL DEFAULT FALSE,
  last_login        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile row on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, phone, city, organisation_name, years_experience, specialisation)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'CLIENT'),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'organisation_name',
    (NEW.raw_user_meta_data->>'years_experience')::INTEGER,
    NEW.raw_user_meta_data->>'specialisation'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- ── 2. PROJECTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
  id             BIGSERIAL   PRIMARY KEY,
  project_number TEXT        NOT NULL UNIQUE,
  name           TEXT        NOT NULL,
  client_id      UUID        REFERENCES public.profiles(id),
  client_name    TEXT,
  designer_id    UUID        REFERENCES public.profiles(id),
  status         TEXT        NOT NULL DEFAULT 'CREATED'
                 CHECK (status IN ('CREATED','DESIGN','QUOTATION_APPROVED','PRODUCTION',
                                   'MATERIALS_PROCURED','INSTALLATION','QC','COMPLETED')),
  budget         NUMERIC(12,2) NOT NULL DEFAULT 0,
  city           TEXT,
  address        TEXT,
  start_date     DATE,
  expected_end   DATE,
  actual_end     DATE,
  progress_pct   INTEGER     NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 3. PROJECT TIMELINE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.project_timeline (
  id          BIGSERIAL   PRIMARY KEY,
  project_id  BIGINT      NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  status      TEXT        NOT NULL,
  notes       TEXT,
  updated_by  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. EMPLOYEES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.employees (
  id          BIGSERIAL   PRIMARY KEY,
  user_id     UUID        REFERENCES public.profiles(id),
  name        TEXT        NOT NULL,
  role        TEXT        NOT NULL,
  department  TEXT,
  phone       TEXT,
  email       TEXT,
  salary      NUMERIC(10,2),
  join_date   DATE,
  status      TEXT        NOT NULL DEFAULT 'ACTIVE'
              CHECK (status IN ('ACTIVE','INACTIVE','ON_LEAVE')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 5. ATTENDANCE ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.attendance (
  id                 BIGSERIAL   PRIMARY KEY,
  employee_id        BIGINT      NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  date               DATE        NOT NULL,
  login_time         TIME,
  logout_time        TIME,
  status             TEXT        NOT NULL DEFAULT 'PRESENT'
                     CHECK (status IN ('PRESENT','ABSENT','LATE','LEAVE','HALF_DAY')),
  productivity_score INTEGER     CHECK (productivity_score BETWEEN 0 AND 100),
  notes              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- ── 6. TASKS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tasks (
  id           BIGSERIAL   PRIMARY KEY,
  project_id   BIGINT      REFERENCES public.projects(id) ON DELETE SET NULL,
  assigned_to  BIGINT      REFERENCES public.employees(id),
  title        TEXT        NOT NULL,
  description  TEXT,
  status       TEXT        NOT NULL DEFAULT 'PENDING'
               CHECK (status IN ('PENDING','IN_PROGRESS','REVIEW','COMPLETED','BLOCKED')),
  priority     TEXT        NOT NULL DEFAULT 'NORMAL'
               CHECK (priority IN ('LOW','NORMAL','HIGH','CRITICAL')),
  due_date     DATE,
  completed_at TIMESTAMPTZ,
  created_by   UUID        REFERENCES public.profiles(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 7. NOTIFICATIONS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id          BIGSERIAL   PRIMARY KEY,
  user_id     UUID        REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        TEXT        NOT NULL DEFAULT 'INFO'
              CHECK (type IN ('APPROVAL','PAYMENT','TASK','ALERT','MESSAGE','MILESTONE','SYSTEM','DOCUMENT')),
  title       TEXT        NOT NULL,
  message     TEXT,
  priority    TEXT        NOT NULL DEFAULT 'NORMAL'
              CHECK (priority IN ('NORMAL','HIGH','CRITICAL')),
  is_read     BOOLEAN     NOT NULL DEFAULT FALSE,
  action_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 8. AUDIT LOG ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_log (
  id          BIGSERIAL   PRIMARY KEY,
  user_id     UUID        REFERENCES public.profiles(id),
  action      TEXT        NOT NULL,
  entity_type TEXT,
  entity_id   BIGINT,
  details     JSONB,
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 9. DOCUMENTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.documents (
  id          BIGSERIAL   PRIMARY KEY,
  project_id  BIGINT      REFERENCES public.projects(id) ON DELETE SET NULL,
  uploaded_by UUID        REFERENCES public.profiles(id),
  name        TEXT        NOT NULL,
  category    TEXT,
  file_type   TEXT,
  file_size   BIGINT,
  file_url    TEXT,
  tag         TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 10. CONTRACTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contracts (
  id           BIGSERIAL     PRIMARY KEY,
  project_id   BIGINT        REFERENCES public.projects(id) ON DELETE SET NULL,
  client_id    UUID          REFERENCES public.profiles(id),
  title        TEXT          NOT NULL,
  status       TEXT          NOT NULL DEFAULT 'DRAFT'
               CHECK (status IN ('DRAFT','SENT','SIGNED','CANCELLED')),
  total_value  NUMERIC(12,2) NOT NULL DEFAULT 0,
  terms        TEXT,
  sent_at      TIMESTAMPTZ,
  signed_at    TIMESTAMPTZ,
  signed_by    TEXT,
  signature_ip TEXT,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE TRIGGER contracts_updated_at BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.contract_milestones (
  id           BIGSERIAL     PRIMARY KEY,
  contract_id  BIGINT        NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  title        TEXT          NOT NULL,
  pct          INTEGER       NOT NULL DEFAULT 0,
  amount       NUMERIC(12,2) NOT NULL DEFAULT 0,
  due_date     DATE,
  paid_at      TIMESTAMPTZ,
  status       TEXT          NOT NULL DEFAULT 'PENDING'
               CHECK (status IN ('PENDING','DUE','PAID'))
);

-- ── 11. VENDORS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vendors (
  id           BIGSERIAL PRIMARY KEY,
  name         TEXT      NOT NULL,
  category     TEXT,
  contact_name TEXT,
  phone        TEXT,
  email        TEXT,
  city         TEXT,
  rating       NUMERIC(2,1) NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  on_time_pct  INTEGER   NOT NULL DEFAULT 100 CHECK (on_time_pct BETWEEN 0 AND 100),
  gstin        TEXT,
  is_active    BOOLEAN   NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 12. PURCHASE ORDERS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id                BIGSERIAL     PRIMARY KEY,
  po_number         TEXT          NOT NULL UNIQUE,
  vendor_id         BIGINT        REFERENCES public.vendors(id),
  project_id        BIGINT        REFERENCES public.projects(id),
  items             JSONB,
  total_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
  status            TEXT          NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED')),
  expected_delivery DATE,
  received_date     DATE,
  notes             TEXT,
  created_by        UUID          REFERENCES public.profiles(id),
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE TRIGGER pos_updated_at BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 13. INVOICES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.invoices (
  id          BIGSERIAL     PRIMARY KEY,
  vendor_id   BIGINT        REFERENCES public.vendors(id),
  po_id       BIGINT        REFERENCES public.purchase_orders(id),
  invoice_no  TEXT          NOT NULL,
  amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
  due_date    DATE,
  paid_at     TIMESTAMPTZ,
  status      TEXT          NOT NULL DEFAULT 'PENDING'
              CHECK (status IN ('PENDING','PAID','OVERDUE')),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── 14. MATERIALS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.materials (
  id                 BIGSERIAL     PRIMARY KEY,
  project_id         BIGINT        REFERENCES public.projects(id) ON DELETE SET NULL,
  name               TEXT          NOT NULL,
  category           TEXT,
  specification      TEXT,
  brand              TEXT,
  quantity_ordered   NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantity_available NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit               TEXT,
  unit_price         NUMERIC(10,2) NOT NULL DEFAULT 0,
  vendor_id          BIGINT        REFERENCES public.vendors(id),
  status             TEXT          NOT NULL DEFAULT 'SPECIFIED'
                     CHECK (status IN ('SPECIFIED','APPROVED','ORDERED','DELIVERED','INSTALLED','SUBSTITUTED')),
  location           TEXT,
  area               TEXT,
  notes              TEXT,
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE TRIGGER materials_updated_at BEFORE UPDATE ON public.materials
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 15. FACTORY JOBS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.factory_jobs (
  id                   BIGSERIAL   PRIMARY KEY,
  project_id           BIGINT      REFERENCES public.projects(id) ON DELETE SET NULL,
  job_number           TEXT        NOT NULL UNIQUE,
  item_type            TEXT        NOT NULL,
  description          TEXT,
  stage                TEXT        NOT NULL DEFAULT 'DESIGN_APPROVED'
                       CHECK (stage IN ('DESIGN_APPROVED','CUTTING','ASSEMBLY','POLISHING','PACKING','DISPATCHED')),
  assigned_to          TEXT,
  quality_check_passed BOOLEAN     NOT NULL DEFAULT FALSE,
  notes                TEXT,
  started_at           TIMESTAMPTZ,
  completed_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER factory_jobs_updated_at BEFORE UPDATE ON public.factory_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 16. TIMESHEETS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.timesheets (
  id          BIGSERIAL     PRIMARY KEY,
  employee_id BIGINT        NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  project_id  BIGINT        REFERENCES public.projects(id),
  week_start  DATE          NOT NULL,
  mon_hrs     NUMERIC(4,1)  NOT NULL DEFAULT 0,
  tue_hrs     NUMERIC(4,1)  NOT NULL DEFAULT 0,
  wed_hrs     NUMERIC(4,1)  NOT NULL DEFAULT 0,
  thu_hrs     NUMERIC(4,1)  NOT NULL DEFAULT 0,
  fri_hrs     NUMERIC(4,1)  NOT NULL DEFAULT 0,
  sat_hrs     NUMERIC(4,1)  NOT NULL DEFAULT 0,
  notes       TEXT,
  status      TEXT          NOT NULL DEFAULT 'DRAFT'
              CHECK (status IN ('DRAFT','SUBMITTED','APPROVED','REJECTED')),
  approved_by UUID          REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE(employee_id, project_id, week_start)
);

-- ── 17. QC CHECKLISTS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.qc_checklists (
  id          BIGSERIAL   PRIMARY KEY,
  project_id  BIGINT      NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  phase       TEXT        NOT NULL,
  item        TEXT        NOT NULL,
  status      TEXT        NOT NULL DEFAULT 'PENDING'
              CHECK (status IN ('PENDING','PASS','FAIL','NA')),
  checked_by  BIGINT      REFERENCES public.employees(id),
  checked_at  TIMESTAMPTZ,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 18. SITE DIARY ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_diary (
  id             BIGSERIAL   PRIMARY KEY,
  project_id     BIGINT      NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  reported_by    BIGINT      REFERENCES public.employees(id),
  report_date    DATE        NOT NULL,
  work_done      TEXT,
  workers_count  INTEGER     NOT NULL DEFAULT 0,
  issues         TEXT,
  materials_used TEXT,
  photos_count   INTEGER     NOT NULL DEFAULT 0,
  weather        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 19. CALENDAR EVENTS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id          BIGSERIAL   PRIMARY KEY,
  project_id  BIGINT      REFERENCES public.projects(id) ON DELETE SET NULL,
  created_by  UUID        REFERENCES public.profiles(id),
  title       TEXT        NOT NULL,
  type        TEXT        NOT NULL DEFAULT 'MEETING'
              CHECK (type IN ('MEETING','SITE_VISIT','MILESTONE','DELIVERY','HANDOVER','OTHER')),
  start_dt    TIMESTAMPTZ NOT NULL,
  end_dt      TIMESTAMPTZ,
  location    TEXT,
  notes       TEXT,
  attendees   JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 20. GPS LOGS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gps_logs (
  id           BIGSERIAL   PRIMARY KEY,
  employee_id  BIGINT      REFERENCES public.employees(id) ON DELETE CASCADE,
  latitude     NUMERIC(10,7),
  longitude    NUMERIC(10,7),
  activity     TEXT        NOT NULL DEFAULT 'WORKING',
  project_id   BIGINT      REFERENCES public.projects(id),
  timestamp    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 21. FINANCIAL / QUOTES ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quotes (
  id           BIGSERIAL     PRIMARY KEY,
  project_id   BIGINT        REFERENCES public.projects(id) ON DELETE SET NULL,
  quote_number TEXT          NOT NULL UNIQUE,
  client_id    UUID          REFERENCES public.profiles(id),
  items        JSONB,
  subtotal     NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_pct      NUMERIC(4,2)  NOT NULL DEFAULT 18,
  discount     NUMERIC(12,2) NOT NULL DEFAULT 0,
  total        NUMERIC(12,2) NOT NULL DEFAULT 0,
  status       TEXT          NOT NULL DEFAULT 'DRAFT'
               CHECK (status IN ('DRAFT','SENT','APPROVED','REJECTED','EXPIRED')),
  valid_until  DATE,
  notes        TEXT,
  created_by   UUID          REFERENCES public.profiles(id),
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── ROW LEVEL SECURITY ─────────────────────────────────────────
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_timeline  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factory_jobs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qc_checklists     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_diary        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gps_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes            ENABLE ROW LEVEL SECURITY;

-- Profiles: user sees own row; admins see all
CREATE POLICY "profiles_self"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin"  ON public.profiles FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','SUPER_ADMIN')));

-- All authenticated users can read core data; admins can write
CREATE POLICY "projects_read"   ON public.projects   FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "projects_write"  ON public.projects   FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','SUPER_ADMIN','DESIGNER')));

CREATE POLICY "employees_read"  ON public.employees  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "employees_write" ON public.employees  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','SUPER_ADMIN')));

CREATE POLICY "vendors_read"    ON public.vendors    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "materials_read"  ON public.materials  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "pos_read"        ON public.purchase_orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "tasks_read"      ON public.tasks      FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "docs_read"       ON public.documents  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "contracts_read"  ON public.contracts  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "factory_read"    ON public.factory_jobs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "calendar_read"   ON public.calendar_events FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "attendance_read" ON public.attendance FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "timesheet_read"  ON public.timesheets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "qc_read"         ON public.qc_checklists FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "diary_read"      ON public.site_diary FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "gps_read"        ON public.gps_logs   FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "quotes_read"     ON public.quotes     FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "invoices_read"   ON public.invoices   FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "milestones_read" ON public.contract_milestones FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "timeline_read"   ON public.project_timeline FOR SELECT USING (auth.role() = 'authenticated');

-- Notifications: user sees own
CREATE POLICY "notif_own"  ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_write" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Audit log: admins only
CREATE POLICY "audit_admin" ON public.audit_log FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','SUPER_ADMIN')));
