-- ============================================================
-- EL SHADDAI — SEED DATA
-- Run AFTER schema.sql
-- Note: profiles rows are created automatically via trigger
-- when users register. This seeds the non-auth tables.
-- ============================================================

-- ── EMPLOYEES ─────────────────────────────────────────────────
INSERT INTO public.employees (name, role, department, phone, email, salary, join_date, status) VALUES
  ('Kiran Sharma',    'Lead Designer',     'Design',      '9876543210', 'kiran@elshaddai.in',    85000, '2022-03-15', 'ACTIVE'),
  ('Lakshmi Iyer',    'Lead Designer',     'Design',      '9876543211', 'lakshmi@elshaddai.in',  82000, '2021-07-01', 'ACTIVE'),
  ('Mohammed Farook', 'Site Builder',      'Construction','9876543212', 'farook@elshaddai.in',   55000, '2020-11-10', 'ACTIVE'),
  ('Priya Menon',     'Project Manager',   'Management',  '9876543213', 'priya@elshaddai.in',    75000, '2023-01-20', 'ACTIVE'),
  ('Suresh Pillai',   'Site Supervisor',   'Construction','9876543214', 'suresh@elshaddai.in',   52000, '2019-06-05', 'ACTIVE'),
  ('Anitha Raj',      'Interior Designer', 'Design',      '9876543215', 'anitha@elshaddai.in',   68000, '2023-04-12', 'ACTIVE'),
  ('Ravi Kumar',      'Factory Head',      'Factory',     '9876543216', 'ravi@elshaddai.in',     60000, '2021-09-30', 'ACTIVE'),
  ('Deepa Thomas',    'QC Inspector',      'Quality',     '9876543217', 'deepa@elshaddai.in',    58000, '2022-08-22', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- ── PROJECTS ─────────────────────────────────────────────────
INSERT INTO public.projects (project_number, name, client_name, status, budget, city, start_date, expected_end, progress_pct) VALUES
  ('PRJ-0012', 'Nair Residence - 3BHK Interior',     'Deepa Nair',    'INSTALLATION',       1850000, 'Chennai',   '2026-04-02', '2026-08-15', 72),
  ('PRJ-0009', 'Kapoor Office - Fit-Out',             'Vinay Kapoor',  'QC',                 3200000, 'Bangalore', '2026-03-15', '2026-07-30', 90),
  ('PRJ-0015', 'Sharma Villa - Luxury Interior',      'Rahul Sharma',  'DESIGN',             5600000, 'Chennai',   '2026-05-08', '2026-12-20', 15),
  ('PRJ-0014', 'Mehta Penthouse - Modern Fit-Out',    'Anil Mehta',    'CREATED',            2800000, 'Mumbai',    '2026-06-01', '2026-11-30',  5),
  ('PRJ-0013', 'Sundar Restaurant - Interior Design', 'Sundar Rajan',  'MATERIALS_PROCURED', 1200000, 'Chennai',   '2026-04-20', '2026-09-10', 55)
ON CONFLICT (project_number) DO NOTHING;

-- ── VENDORS ───────────────────────────────────────────────────
INSERT INTO public.vendors (name, category, contact_name, phone, email, city, rating, on_time_pct) VALUES
  ('Rajesh Timbers',    'Wood & Ply',    'Rajesh Nair',   '9944112233', 'rajesh@timbers.in',   'Chennai',   4.8, 95),
  ('Stone Imports Pvt', 'Stone & Tiles', 'Arjun Pillai',  '9944112234', 'stone@imports.in',    'Bangalore', 4.5, 88),
  ('National Paints',   'Paint',         'Sunil Kumar',   '9944112235', 'sunil@natpaint.in',   'Chennai',   4.6, 92),
  ('Hettich India',     'Hardware',      'Kavya Menon',   '9944112236', 'kavya@hettich.in',    'Mumbai',    4.9, 98),
  ('Local Workshop',    'Fabrication',   'Ramu Krishnan', '9944112237', 'ramu@workshop.in',    'Chennai',   4.2, 85)
ON CONFLICT DO NOTHING;

-- ── PURCHASE ORDERS (linked to first 3 projects by row position) ─
INSERT INTO public.purchase_orders (po_number, vendor_id, project_id, items, total_amount, status, expected_delivery, received_date)
SELECT
  po.po_number, v.id, p.id, po.items::jsonb, po.amount, po.status, po.exp::date, po.recv::date
FROM (VALUES
  ('PO-0041','Rajesh Timbers',   1, '[{"name":"Teak Veneer","qty":120,"unit":"sqft"}]',             56640,  'DELIVERED', '2026-05-20', '2026-05-19'),
  ('PO-0043','Stone Imports Pvt',2, '[{"name":"Carrara Marble Tiles","qty":420,"unit":"sqft"}]',   159300,  'IN_TRANSIT','2026-06-20', null),
  ('PO-0044','National Paints',  1, '[{"name":"Asian Paints Royale","qty":32,"unit":"ltr"}]',       12160,  'DELIVERED', '2026-06-01', '2026-05-31'),
  ('PO-0045','Hettich India',    3, '[{"name":"Hafele Sliding System","qty":3,"unit":"set"}]',     126000,  'PENDING',   '2026-07-01', null),
  ('PO-0046','Local Workshop',   5, '[{"name":"Custom Joinery","qty":1,"unit":"lot"}]',             85000,  'CONFIRMED', '2026-06-25', null)
) AS po(po_number, vendor_name, proj_idx, items, amount, status, exp, recv)
JOIN public.vendors v ON v.name = po.vendor_name
JOIN (SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn FROM public.projects) p ON p.rn = po.proj_idx
ON CONFLICT (po_number) DO NOTHING;

-- ── MATERIALS ─────────────────────────────────────────────────
INSERT INTO public.materials (project_id, name, category, brand, quantity_ordered, quantity_available, unit, unit_price, status, location, area)
SELECT p.id, m.name, m.cat, m.brand, m.qty_o, m.qty_a, m.unit, m.price, m.status, m.loc, m.area
FROM (VALUES
  (1,'Pergo Flooring — Oak Natural',      'Flooring','Pergo',       200, 200, 'sqft', 285, 'DELIVERED',  'Site — Bedroom 1',          'Bedrooms'),
  (1,'Armstrong False Ceiling Tiles',     'Ceiling', 'Armstrong',   450, 380, 'sqft',  95, 'INSTALLED',  'Site — Living/Dining',      'Living Room'),
  (1,'Silestone Quartz Counter',          'Stone',   'Silestone',     3,   0, 'slab',30667,'ORDERED',    'Vendor — dispatch pending', 'Kitchen'),
  (1,'Hettich Push-to-Open Hinges',       'Hardware','Hettich',      24,  24, 'pcs',  850, 'DELIVERED',  'Site — Kitchen',            'Kitchen'),
  (1,'Kohler Archer WC Suite',            'Sanitary','Kohler',        3,   3, 'set', 42000,'DELIVERED',  'Site — Bathrooms',          'Bathrooms'),
  (2,'Carrara Marble Tiles 800×800',      'Flooring','RAK Ceramics', 420, 420,'sqft', 145, 'DELIVERED',  'Site — Kapoor Office',      'Reception'),
  (2,'Teak Veneer Sheets',                'Wood',    'Rajesh Timbers',200,  22,'sqft', 185, 'IN_WAREHOUSE','Warehouse A — Bay 3',      'Cabinets'),
  (3,'Asian Paints Royale Luxury',        'Paint',   'Asian Paints',  32,  32,'ltr',  380, 'DELIVERED',  'Site — Nair Residence',     'All Rooms'),
  (3,'Marine Ply 18mm BWP',               'Wood',    'Greenply',      80,  80,'sheets',1800,'IN_WAREHOUSE','Warehouse A — Bay 1',     'Furniture'),
  (5,'Custom Bar Counter Granite',        'Stone',   'Stone Imports',  2,   0,'slab', 38000,'SPECIFIED',  'Vendor — to be ordered',   'Bar Area')
) AS m(proj_idx, name, cat, brand, qty_o, qty_a, unit, price, status, loc, area)
JOIN (SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn FROM public.projects) p ON p.rn = m.proj_idx
ON CONFLICT DO NOTHING;

-- ── FACTORY JOBS ──────────────────────────────────────────────
INSERT INTO public.factory_jobs (project_id, job_number, item_type, stage, assigned_to)
SELECT p.id, f.job_no, f.item, f.stage, f.worker
FROM (VALUES
  (1,'FAB-018','Master Bedroom Wardrobe — 3-door sliding', 'ASSEMBLY',      'Ravi Kumar'),
  (1,'FAB-019','Kitchen Cabinet Carcass set',              'POLISHING',     'Ravi Kumar'),
  (2,'FAB-020','Reception Counter — walnut veneer',        'PACKING',       'Ravi Kumar'),
  (2,'FAB-021','Conference Room TV Unit',                  'DISPATCHED',    'Ravi Kumar'),
  (5,'FAB-022','Restaurant Bar Counter frame',             'CUTTING',       'Ravi Kumar')
) AS f(proj_idx, job_no, item, stage, worker)
JOIN (SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn FROM public.projects) p ON p.rn = f.proj_idx
ON CONFLICT (job_number) DO NOTHING;

-- ── CONTRACTS ─────────────────────────────────────────────────
INSERT INTO public.contracts (project_id, title, status, total_value, signed_at)
SELECT p.id, c.title, c.status, c.val, c.signed::timestamptz
FROM (VALUES
  (1,'Nair Residence Interior Contract',   'SIGNED', 1850000, '2026-04-05 10:00:00'),
  (2,'Kapoor Office Fit-Out Agreement',    'SIGNED', 3200000, '2026-03-18 14:30:00'),
  (3,'Sharma Villa Luxury Interior',       'SENT',   5600000, null),
  (4,'Mehta Penthouse Design Contract',    'DRAFT',  2800000, null)
) AS c(proj_idx, title, status, val, signed)
JOIN (SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn FROM public.projects) p ON p.rn = c.proj_idx
ON CONFLICT DO NOTHING;

-- ── ATTENDANCE (today) ────────────────────────────────────────
INSERT INTO public.attendance (employee_id, date, login_time, logout_time, status, productivity_score)
SELECT e.id, CURRENT_DATE, a.login::time, a.logout::time, a.status, a.score
FROM (VALUES
  ('Kiran Sharma',    '08:30', '18:00', 'PRESENT', 91),
  ('Lakshmi Iyer',    '09:00', '18:30', 'PRESENT', 88),
  ('Mohammed Farook', '08:15', '17:45', 'PRESENT', 82),
  ('Priya Menon',     '09:30', null,    'PRESENT', 79),
  ('Suresh Pillai',   null,    null,    'LEAVE',   null),
  ('Anitha Raj',      '09:45', null,    'LATE',    68),
  ('Ravi Kumar',      '08:50', '18:00', 'PRESENT', 85),
  ('Deepa Thomas',    '08:00', '17:30', 'PRESENT', 93)
) AS a(emp_name, login, logout, status, score)
JOIN public.employees e ON e.name = a.emp_name
ON CONFLICT (employee_id, date) DO NOTHING;

-- ── QC CHECKLIST (Kapoor Office — QC phase) ───────────────────
INSERT INTO public.qc_checklists (project_id, phase, item, status, checked_at)
SELECT p.id, q.phase, q.item, q.status, q.checked::timestamptz
FROM (VALUES
  (2,'INSTALLATION','False ceiling level check',         'PASS', '2026-06-10 09:00:00'),
  (2,'INSTALLATION','Electrical points — all functional','PASS', '2026-06-10 10:30:00'),
  (2,'INSTALLATION','Tile grout — uniform & sealed',     'PASS', '2026-06-11 11:00:00'),
  (2,'INSTALLATION','Wardrobe alignment & finish',        'FAIL', '2026-06-11 14:00:00'),
  (2,'QC',          'Paint finish — no brush marks',     'PENDING', null),
  (2,'QC',          'Hardware snag list cleared',        'PENDING', null),
  (2,'QC',          'Final deep clean done',             'PENDING', null)
) AS q(proj_idx, phase, item, status, checked)
JOIN (SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn FROM public.projects) p ON p.rn = q.proj_idx
ON CONFLICT DO NOTHING;

-- ── SITE DIARY ────────────────────────────────────────────────
INSERT INTO public.site_diary (project_id, report_date, work_done, workers_count, weather)
SELECT p.id, d.dt::date, d.work, d.wc, d.weather
FROM (VALUES
  (1, '2026-06-17', 'Wardrobe installation in master bedroom 80% complete. Skirting work in living room done.', 6, 'Sunny'),
  (2, '2026-06-17', 'QC inspection in progress. Punch list being cleared by site team.', 4, 'Cloudy'),
  (5, '2026-06-16', 'Bar counter base frame installed. Tile work in dining area complete.', 5, 'Sunny')
) AS d(proj_idx, dt, work, wc, weather)
JOIN (SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn FROM public.projects) p ON p.rn = d.proj_idx
ON CONFLICT DO NOTHING;
