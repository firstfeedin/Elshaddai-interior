import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { quotes as quotesApi } from '../lib/api'

const sans  = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
const gold  = '#c9a227'
const dark  = '#1c1917'
const stone = '#57534e'
const light = '#fafaf9'
const bdr   = '#e7e5e4'

// ── Shared ────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return <div style={{ background: '#fff', border: `1px solid ${bdr}`, padding: 24, ...style }}>{children}</div>
}
function SectionTitle({ children }) {
  return <p style={{ ...serif, fontSize: 22, fontWeight: 300, color: dark, margin: '0 0 20px' }}>{children}</p>
}
function Tag({ children, color }) {
  const c = color || stone
  return <span style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: c, border: `1px solid ${c}`, padding: '2px 8px' }}>{children}</span>
}
function Btn({ children, onClick, variant = 'primary', disabled, style = {} }) {
  const bg   = variant === 'primary' ? gold  : variant === 'ghost' ? 'transparent' : '#fff'
  const col  = variant === 'primary' ? '#000' : dark
  const bord = variant === 'primary' ? 'none' : `1px solid ${bdr}`
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...sans, padding: '9px 22px', background: bg, border: bord, color: col, fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, ...style }}>
      {children}
    </button>
  )
}

// ── Data ──────────────────────────────────────────────────────────
const PROJECTS = [
  { id: 'p1', name: 'Mehta Villa — 3BHK Interior',   client: 'Rajesh Mehta',  city: 'Chennai',    budget: 2800000, area: 1800 },
  { id: 'p2', name: 'Sundar Apartment Renovation',   client: 'Priya Sundar',  city: 'Coimbatore', budget: 1200000, area: 950  },
  { id: 'p3', name: 'Kapoor Office Space',            client: 'Anil Kapoor',   city: 'Bangalore',  budget: 3500000, area: 2200 },
  { id: 'p4', name: 'Sharma Residence Premium',       client: 'Deepa Sharma',  city: 'Chennai',    budget: 4200000, area: 2600 },
]

const LINE_CATEGORIES = ['Furniture', 'Flooring', 'Ceiling', 'Wall Finish', 'Lighting', 'Electrical', 'Civil Work', 'Labour', 'Design Fees', 'Miscellaneous']

const MOCK_INVOICES = [
  { id: 'INV-001', project_id: 'p1', invoice_no: 'ES-INV-2025-001', date: '2025-05-01', due_date: '2025-05-15', subtotal: 840000, gst: 151200, total: 991200,  status: 'PAID',    milestone: 'Design Advance (30%)' },
  { id: 'INV-002', project_id: 'p1', invoice_no: 'ES-INV-2025-002', date: '2025-06-01', due_date: '2025-06-15', subtotal: 560000, gst: 100800, total: 660800,  status: 'PENDING', milestone: 'Mid-Execution (20%)' },
  { id: 'INV-003', project_id: 'p2', invoice_no: 'ES-INV-2025-003', date: '2025-05-20', due_date: '2025-06-04', subtotal: 360000, gst: 64800,  total: 424800,  status: 'OVERDUE', milestone: 'Design Advance (30%)' },
  { id: 'INV-004', project_id: 'p3', invoice_no: 'ES-INV-2025-004', date: '2025-06-10', due_date: '2025-06-25', subtotal: 700000, gst: 126000, total: 826000,  status: 'DRAFT',   milestone: 'Booking Advance (20%)' },
]

const PAYMENT_MILESTONES = [
  { label: 'Booking Advance',    pct: 20, trigger: 'On project sign-off',               status: 'PAID'    },
  { label: 'Design Advance',     pct: 30, trigger: 'On concept design approval',         status: 'PAID'    },
  { label: 'Mid-Execution',      pct: 20, trigger: 'On 50% site work completion',        status: 'PENDING' },
  { label: 'Pre-Completion',     pct: 20, trigger: 'On 90% work completion',             status: 'UNPAID'  },
  { label: 'Final Settlement',   pct: 10, trigger: 'On handover & client sign-off',      status: 'UNPAID'  },
]

// ── Quote Builder Tab ─────────────────────────────────────────────
const EMPTY_LINE = () => ({ id: Date.now(), category: 'Furniture', description: '', qty: 1, unit: 'nos', rate: 0 })

function QuoteBuilder() {
  const [project, setProject]  = useState(PROJECTS[0])
  const [lines, setLines]      = useState([
    { id: 1, category: 'Design Fees', description: 'Interior Design Consultation & 3D Visualisation', qty: 1,   unit: 'lumpsum', rate: 150000 },
    { id: 2, category: 'Furniture',   description: 'Custom Modular Wardrobe — Master Bedroom (8×9ft)', qty: 1,   unit: 'nos',     rate: 185000 },
    { id: 3, category: 'Furniture',   description: 'L-Shaped Sofa (Premium Fabric)',                  qty: 1,   unit: 'nos',     rate: 95000  },
    { id: 4, category: 'Flooring',    description: 'Italian Marble — Living & Dining (900 sqft)',     qty: 900, unit: 'sqft',    rate: 450    },
    { id: 5, category: 'Wall Finish', description: 'Textured Paint — Feature Wall',                   qty: 3,   unit: 'nos',     rate: 18000  },
    { id: 6, category: 'Labour',      description: 'Site Labour — Execution Phase',                   qty: 1,   unit: 'lumpsum', rate: 180000 },
  ])
  const [gstRate, setGstRate]  = useState(18)
  const [discount, setDiscount]= useState(0)
  const [notes, setNotes]      = useState('• All prices inclusive of material and installation unless stated.\n• This quote is valid for 30 days from the date of issue.\n• Payment terms as per the signed agreement.')
  const [saved, setSaved]      = useState(false)

  const subtotal   = lines.reduce((s, l) => s + l.qty * l.rate, 0)
  const discAmt    = subtotal * (discount / 100)
  const afterDisc  = subtotal - discAmt
  const gstAmt     = afterDisc * (gstRate / 100)
  const grand      = afterDisc + gstAmt

  function updateLine(id, field, val) {
    setLines(ls => ls.map(l => l.id === id ? { ...l, [field]: field === 'qty' || field === 'rate' ? +val : val } : l))
  }
  function addLine()     { setLines(ls => [...ls, EMPTY_LINE()]) }
  function removeLine(id){ setLines(ls => ls.filter(l => l.id !== id)) }

  async function saveQuote() {
    try {
      await quotesApi.create({
        project_id: project.id,
        subtotal: afterDisc,
        total_amount: grand,
        gst_rate: gstRate,
        discount_pct: discount,
        notes: notes,
        status: 'DRAFT',
        line_items: lines.map(l => ({ category: l.category, description: l.description, qty: l.qty, unit: l.unit, rate: l.rate })),
      })
    } catch { /* save locally still */ }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const fmtINR = n => '₹' + Math.round(n).toLocaleString('en-IN')

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
      <div>
        {/* Header */}
        <Card style={{ marginBottom: 16, padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <SectionTitle>Quote Builder</SectionTitle>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="ghost" onClick={() => window.print()}>Print</Btn>
              <Btn onClick={saveQuote}>{saved ? '✓ Saved' : 'Save Quote'}</Btn>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ ...sans, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: stone, display: 'block', marginBottom: 5 }}>Project</label>
              <select value={project.id} onChange={e => setProject(PROJECTS.find(p => p.id === e.target.value))}
                style={{ ...sans, width: '100%', padding: '8px 12px', border: `1px solid ${bdr}`, fontSize: 12, color: dark, background: '#fff' }}>
                {PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ ...sans, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: stone, display: 'block', marginBottom: 5 }}>GST %</label>
              <input type="number" value={gstRate} onChange={e => setGstRate(+e.target.value)} min={0} max={28}
                style={{ ...sans, width: 80, padding: '8px 12px', border: `1px solid ${bdr}`, fontSize: 12, color: dark }} />
            </div>
            <div>
              <label style={{ ...sans, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: stone, display: 'block', marginBottom: 5 }}>Discount %</label>
              <input type="number" value={discount} onChange={e => setDiscount(+e.target.value)} min={0} max={30}
                style={{ ...sans, width: 80, padding: '8px 12px', border: `1px solid ${bdr}`, fontSize: 12, color: dark }} />
            </div>
          </div>
        </Card>

        {/* Line items */}
        <Card style={{ marginBottom: 16, padding: 0 }}>
          <div style={{ padding: '16px 24px', borderBottom: `1px solid ${bdr}` }}>
            <p style={{ ...sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: 0 }}>Line Items</p>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${dark}`, background: light }}>
                {['#', 'Category', 'Description', 'Qty', 'Unit', 'Rate (₹)', 'Amount', ''].map(h => (
                  <th key={h} style={{ ...sans, fontSize: 8.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: stone, padding: '10px 12px', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={l.id} style={{ borderBottom: `1px solid ${bdr}` }}>
                  <td style={{ ...sans, fontSize: 11, color: stone, padding: '8px 12px', width: 30 }}>{i + 1}</td>
                  <td style={{ padding: '6px 12px 6px 0', width: 130 }}>
                    <select value={l.category} onChange={e => updateLine(l.id, 'category', e.target.value)}
                      style={{ ...sans, fontSize: 11, padding: '6px 8px', border: `1px solid ${bdr}`, background: '#fff', color: dark, width: '100%' }}>
                      {LINE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '6px 12px 6px 0' }}>
                    <input value={l.description} onChange={e => updateLine(l.id, 'description', e.target.value)} placeholder="Description…"
                      style={{ ...sans, fontSize: 12, padding: '6px 10px', border: `1px solid ${bdr}`, color: dark, width: '100%', boxSizing: 'border-box' }} />
                  </td>
                  <td style={{ padding: '6px 8px 6px 0', width: 60 }}>
                    <input type="number" value={l.qty} onChange={e => updateLine(l.id, 'qty', e.target.value)} min={0}
                      style={{ ...sans, fontSize: 12, padding: '6px 8px', border: `1px solid ${bdr}`, color: dark, width: '100%' }} />
                  </td>
                  <td style={{ padding: '6px 8px 6px 0', width: 80 }}>
                    <select value={l.unit} onChange={e => updateLine(l.id, 'unit', e.target.value)}
                      style={{ ...sans, fontSize: 11, padding: '6px 4px', border: `1px solid ${bdr}`, background: '#fff', color: dark, width: '100%' }}>
                      {['nos', 'sqft', 'rft', 'ltr', 'kg', 'lumpsum', 'set'].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '6px 8px 6px 0', width: 100 }}>
                    <input type="number" value={l.rate} onChange={e => updateLine(l.id, 'rate', e.target.value)} min={0}
                      style={{ ...sans, fontSize: 12, padding: '6px 8px', border: `1px solid ${bdr}`, color: dark, width: '100%' }} />
                  </td>
                  <td style={{ ...sans, fontSize: 12, fontWeight: 600, color: dark, padding: '6px 12px', width: 110, textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {fmtINR(l.qty * l.rate)}
                  </td>
                  <td style={{ padding: '6px 12px', width: 30 }}>
                    <button onClick={() => removeLine(l.id)}
                      style={{ width: 22, height: 22, background: light, border: `1px solid ${bdr}`, color: '#a8a29e', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '12px 24px' }}>
            <button onClick={addLine}
              style={{ ...sans, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: gold, background: 'none', border: `1px dashed ${gold}`, padding: '7px 18px', cursor: 'pointer' }}>
              + Add Line Item
            </button>
          </div>
        </Card>

        {/* Notes */}
        <Card>
          <p style={{ ...sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: '0 0 10px' }}>Terms & Notes</p>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
            style={{ ...sans, width: '100%', padding: '10px 12px', border: `1px solid ${bdr}`, fontSize: 12, color: dark, resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.7 }} />
        </Card>
      </div>

      {/* Summary panel */}
      <div style={{ position: 'sticky', top: 20 }}>
        <Card style={{ marginBottom: 14 }}>
          <p style={{ ...sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: '0 0 16px' }}>Quote Summary</p>

          <div style={{ background: dark, padding: '16px', marginBottom: 16 }}>
            <p style={{ ...serif, fontSize: 15, fontWeight: 300, color: '#e7e5e4', margin: '0 0 2px' }}>{project.name}</p>
            <p style={{ ...sans, fontSize: 10, color: '#78716c', margin: 0 }}>{project.client} · {project.city}</p>
          </div>

          {[
            ['Subtotal', subtotal],
            discount > 0 && [`Discount (${discount}%)`, -discAmt],
            discount > 0 && ['After Discount', afterDisc],
          ].filter(Boolean).map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${bdr}` }}>
              <span style={{ ...sans, fontSize: 12, color: stone }}>{label}</span>
              <span style={{ ...sans, fontSize: 12, color: val < 0 ? '#22c55e' : dark }}>{fmtINR(val)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${bdr}` }}>
            <span style={{ ...sans, fontSize: 12, color: stone }}>GST @ {gstRate}%</span>
            <span style={{ ...sans, fontSize: 12, color: dark }}>{fmtINR(gstAmt)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0 0' }}>
            <span style={{ ...serif, fontSize: 16, fontWeight: 500, color: dark }}>Grand Total</span>
            <span style={{ ...serif, fontSize: 20, fontWeight: 500, color: gold }}>{fmtINR(grand)}</span>
          </div>

          {project.budget > 0 && (
            <div style={{ marginTop: 14, padding: '10px 12px', background: grand > project.budget ? '#fef2f2' : `${gold}0a`, border: `1px solid ${grand > project.budget ? '#fecaca' : gold + '40'}` }}>
              <p style={{ ...sans, fontSize: 10, color: grand > project.budget ? '#ef4444' : stone, margin: 0 }}>
                {grand > project.budget
                  ? `⚠ Exceeds client budget by ${fmtINR(grand - project.budget)}`
                  : `✓ Within budget — ${fmtINR(project.budget - grand)} remaining`}
              </p>
            </div>
          )}
        </Card>

        {/* Payment milestones */}
        <Card>
          <p style={{ ...sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: '0 0 14px' }}>Payment Schedule</p>
          {PAYMENT_MILESTONES.map(m => {
            const amt = grand * (m.pct / 100)
            const color = m.status === 'PAID' ? '#22c55e' : m.status === 'PENDING' ? gold : '#a8a29e'
            return (
              <div key={m.label} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 2, background: color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ ...sans, fontSize: 11, fontWeight: 600, color: dark }}>{m.label} ({m.pct}%)</span>
                    <span style={{ ...serif, fontSize: 13, color: color }}>{fmtINR(amt)}</span>
                  </div>
                  <p style={{ ...sans, fontSize: 10, color: stone, margin: '0 0 4px' }}>{m.trigger}</p>
                  <span style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color, border: `1px solid ${color}`, padding: '1px 7px' }}>{m.status}</span>
                </div>
              </div>
            )
          })}
        </Card>
      </div>
    </div>
  )
}

// ── Invoices Tab ──────────────────────────────────────────────────
function InvoicesTab() {
  const [invoices, setInvoices] = useState(MOCK_INVOICES)
  const [selected, setSelected] = useState(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ project_id: 'p1', milestone: '', subtotal: '', due_date: '' })

  useEffect(() => {
    quotesApi.list()
      .then(data => {
        const arr = Array.isArray(data) ? data : []
        if (arr.length > 0) {
          const mapped = arr.map(q => ({
            id: String(q.id),
            project_id: String(q.project_id || 'p1'),
            invoice_no: q.quote_number || `ES-QT-${q.id}`,
            date: q.created_at?.split('T')[0] || '—',
            due_date: q.valid_until || '—',
            subtotal: q.subtotal || 0,
            gst: (q.subtotal || 0) * 0.18,
            total: q.total_amount || 0,
            status: q.status === 'ACCEPTED' ? 'PAID' : q.status === 'SENT' ? 'PENDING' : 'DRAFT',
            milestone: q.notes || '—',
          }))
          setInvoices(mapped)
        }
      })
      .catch(() => {})
  }, [])

  const STATUS_C = { PAID: '#22c55e', PENDING: gold, OVERDUE: '#ef4444', DRAFT: '#94a3b8' }
  const fmtINR = n => '₹' + Math.round(n).toLocaleString('en-IN')

  function createInvoice() {
    const sub = +form.subtotal
    const gst = sub * 0.18
    const proj = PROJECTS.find(p => p.id === form.project_id)
    const newInv = {
      id: `INV-${Date.now()}`,
      ...form,
      invoice_no: `ES-INV-2025-00${invoices.length + 1}`,
      date: new Date().toISOString().slice(0, 10),
      subtotal: sub, gst, total: sub + gst,
      status: 'DRAFT',
    }
    setInvoices(prev => [newInv, ...prev])
    setCreating(false)
    setForm({ project_id: 'p1', milestone: '', subtotal: '', due_date: '' })
  }

  function markPaid(id) {
    setInvoices(iv => iv.map(i => i.id === id ? { ...i, status: 'PAID' } : i))
    setSelected(null)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <SectionTitle>Invoices</SectionTitle>
          <Btn onClick={() => setCreating(true)}>+ New Invoice</Btn>
        </div>

        {creating && (
          <Card style={{ marginBottom: 16, border: `1px solid ${gold}` }}>
            <p style={{ ...sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: gold, margin: '0 0 16px' }}>Create Invoice</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ ...sans, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: stone, display: 'block', marginBottom: 5 }}>Project</label>
                <select value={form.project_id} onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))}
                  style={{ ...sans, width: '100%', padding: '8px 12px', border: `1px solid ${bdr}`, fontSize: 12, color: dark, background: '#fff' }}>
                  {PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name.split(' — ')[0]}</option>)}
                </select>
              </div>
              <div>
                <label style={{ ...sans, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: stone, display: 'block', marginBottom: 5 }}>Milestone</label>
                <input value={form.milestone} onChange={e => setForm(f => ({ ...f, milestone: e.target.value }))} placeholder="e.g. Design Advance (30%)"
                  style={{ ...sans, width: '100%', padding: '8px 12px', border: `1px solid ${bdr}`, fontSize: 12, color: dark, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ ...sans, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: stone, display: 'block', marginBottom: 5 }}>Subtotal (₹)</label>
                <input type="number" value={form.subtotal} onChange={e => setForm(f => ({ ...f, subtotal: e.target.value }))} placeholder="Amount before GST"
                  style={{ ...sans, width: '100%', padding: '8px 12px', border: `1px solid ${bdr}`, fontSize: 12, color: dark, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ ...sans, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: stone, display: 'block', marginBottom: 5 }}>Due Date</label>
                <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                  style={{ ...sans, width: '100%', padding: '8px 12px', border: `1px solid ${bdr}`, fontSize: 12, color: dark, boxSizing: 'border-box' }} />
              </div>
            </div>
            {form.subtotal && (
              <p style={{ ...sans, fontSize: 11, color: stone, margin: '0 0 12px' }}>
                GST (18%): {fmtINR(+form.subtotal * 0.18)} · <strong>Total: {fmtINR(+form.subtotal * 1.18)}</strong>
              </p>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn onClick={createInvoice} disabled={!form.subtotal || !form.milestone}>Create Draft</Btn>
              <Btn variant="ghost" onClick={() => setCreating(false)}>Cancel</Btn>
            </div>
          </Card>
        )}

        {invoices.map(inv => {
          const proj = PROJECTS.find(p => p.id === inv.project_id)
          const c = STATUS_C[inv.status] || stone
          return (
            <div key={inv.id} onClick={() => setSelected(selected?.id === inv.id ? null : inv)}
              style={{ background: '#fff', border: `1px solid ${selected?.id === inv.id ? gold : bdr}`, padding: '16px 20px', marginBottom: 8, cursor: 'pointer', transition: 'border-color 0.15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ ...sans, fontSize: 12, fontWeight: 700, color: dark }}>{inv.invoice_no}</span>
                    <span style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: c, border: `1px solid ${c}`, padding: '1px 7px' }}>{inv.status}</span>
                  </div>
                  <p style={{ ...sans, fontSize: 11, color: stone, margin: '0 0 2px' }}>{proj?.client} · {inv.milestone}</p>
                  <p style={{ ...sans, fontSize: 10, color: '#a8a29e', margin: 0 }}>Issued {inv.date} · Due {inv.due_date}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ ...serif, fontSize: 20, fontWeight: 300, color: dark, margin: '0 0 2px' }}>{fmtINR(inv.total)}</p>
                  <p style={{ ...sans, fontSize: 10, color: stone, margin: 0 }}>incl. GST ₹{Math.round(inv.gst).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Invoice preview */}
      {selected && (
        <div style={{ position: 'sticky', top: 20 }}>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {/* Invoice header */}
            <div style={{ background: dark, padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ ...serif, fontSize: 18, fontWeight: 300, color: '#fff', margin: '0 0 2px' }}>El Shaddai Interiors</p>
                  <p style={{ ...sans, fontSize: 9, color: gold, letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0 }}>50 Years of Engineering Excellence</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ ...serif, fontSize: 22, color: gold, margin: '0 0 2px' }}>INVOICE</p>
                  <p style={{ ...sans, fontSize: 10, color: '#78716c', margin: 0 }}>{selected.invoice_no}</p>
                </div>
              </div>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <p style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: '0 0 6px' }}>Bill To</p>
                  <p style={{ ...sans, fontSize: 12, fontWeight: 600, color: dark, margin: '0 0 2px' }}>{PROJECTS.find(p => p.id === selected.project_id)?.client}</p>
                  <p style={{ ...sans, fontSize: 11, color: stone, margin: 0 }}>{PROJECTS.find(p => p.id === selected.project_id)?.city}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ ...sans, fontSize: 10, color: stone }}>Invoice Date</span>
                    <span style={{ ...sans, fontSize: 10, color: dark }}>{selected.date}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ ...sans, fontSize: 10, color: stone }}>Due Date</span>
                    <span style={{ ...sans, fontSize: 10, color: dark }}>{selected.due_date}</span>
                  </div>
                </div>
              </div>

              <div style={{ border: `1px solid ${bdr}`, marginBottom: 16 }}>
                <div style={{ background: light, padding: '8px 14px', borderBottom: `1px solid ${bdr}` }}>
                  <p style={{ ...sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: stone, margin: 0 }}>{selected.milestone}</p>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ ...sans, fontSize: 11, color: stone }}>Subtotal</span>
                    <span style={{ ...sans, fontSize: 11, color: dark }}>{fmtINR(selected.subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, paddingBottom: 10, borderBottom: `1px solid ${bdr}` }}>
                    <span style={{ ...sans, fontSize: 11, color: stone }}>GST (CGST 9% + SGST 9%)</span>
                    <span style={{ ...sans, fontSize: 11, color: dark }}>{fmtINR(selected.gst)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ ...serif, fontSize: 15, fontWeight: 500, color: dark }}>Total Due</span>
                    <span style={{ ...serif, fontSize: 18, color: gold }}>{fmtINR(selected.total)}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                {selected.status !== 'PAID' && (
                  <Btn onClick={() => markPaid(selected.id)} style={{ flex: 1 }}>Mark as Paid</Btn>
                )}
                <Btn variant="ghost" onClick={() => window.print()} style={{ flex: 1 }}>Print / PDF</Btn>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

// ── P&L Tab ───────────────────────────────────────────────────────
function PLTab() {
  const PL_DATA = [
    { project: 'Mehta Villa', budget: 2800000, revenue: 2800000, material_cost: 980000, labour_cost: 420000, design_fees: 280000, overhead: 140000 },
    { project: 'Sundar Apartment', budget: 1200000, revenue: 1050000, material_cost: 380000, labour_cost: 195000, design_fees: 120000, overhead: 60000 },
    { project: 'Kapoor Office', budget: 3500000, revenue: 700000, material_cost: 210000, labour_cost: 140000, design_fees: 175000, overhead: 87500 },
    { project: 'Sharma Residence', budget: 4200000, revenue: 3360000, material_cost: 1260000, labour_cost: 504000, design_fees: 336000, overhead: 168000 },
  ]

  const fmtINR = n => '₹' + Math.abs(Math.round(n)).toLocaleString('en-IN')

  const totals = PL_DATA.reduce((acc, r) => {
    acc.revenue += r.revenue
    acc.material += r.material_cost
    acc.labour  += r.labour_cost
    acc.design  += r.design_fees
    acc.overhead += r.overhead
    return acc
  }, { revenue: 0, material: 0, labour: 0, design: 0, overhead: 0 })
  const totalCost   = totals.material + totals.labour + totals.design + totals.overhead
  const totalProfit = totals.revenue - totalCost
  const margin      = ((totalProfit / totals.revenue) * 100).toFixed(1)

  return (
    <div>
      <SectionTitle>Profit & Loss — Project Level</SectionTitle>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Total Revenue', value: fmtINR(totals.revenue), accent: gold },
          { label: 'Total Costs',   value: fmtINR(totalCost) },
          { label: 'Net Profit',    value: fmtINR(totalProfit), accent: totalProfit > 0 ? '#22c55e' : '#ef4444' },
          { label: 'Margin',        value: margin + '%', accent: +margin > 25 ? '#22c55e' : gold },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: '#fff', border: `1px solid ${bdr}`, padding: '18px 22px' }}>
            <p style={{ ...sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: '0 0 8px' }}>{s.label}</p>
            <p style={{ ...serif, fontSize: 28, fontWeight: 300, color: s.accent || dark, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <Card style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: dark }}>
              {['Project', 'Revenue', 'Material', 'Labour', 'Design Fees', 'Overhead', 'Total Cost', 'Profit', 'Margin'].map(h => (
                <th key={h} style={{ ...sans, fontSize: 8.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: gold, padding: '12px 16px', textAlign: h === 'Project' ? 'left' : 'right' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PL_DATA.map((r, i) => {
              const cost   = r.material_cost + r.labour_cost + r.design_fees + r.overhead
              const profit = r.revenue - cost
              const mgn    = ((profit / r.revenue) * 100).toFixed(1)
              return (
                <tr key={r.project} style={{ borderBottom: `1px solid ${bdr}`, background: i % 2 === 0 ? '#fff' : light }}>
                  <td style={{ ...sans, fontSize: 12, fontWeight: 500, color: dark, padding: '12px 16px' }}>{r.project}</td>
                  {[r.revenue, r.material_cost, r.labour_cost, r.design_fees, r.overhead, cost].map((v, vi) => (
                    <td key={vi} style={{ ...sans, fontSize: 11, color: dark, padding: '12px 16px', textAlign: 'right' }}>{fmtINR(v)}</td>
                  ))}
                  <td style={{ ...sans, fontSize: 11, fontWeight: 700, color: profit > 0 ? '#22c55e' : '#ef4444', padding: '12px 16px', textAlign: 'right' }}>{fmtINR(profit)}</td>
                  <td style={{ ...sans, fontSize: 11, fontWeight: 700, color: +mgn > 25 ? '#22c55e' : +mgn > 15 ? gold : '#ef4444', padding: '12px 16px', textAlign: 'right' }}>{mgn}%</td>
                </tr>
              )
            })}
            {/* Totals row */}
            <tr style={{ background: dark, borderTop: `2px solid ${gold}` }}>
              <td style={{ ...sans, fontSize: 11, fontWeight: 700, color: gold, padding: '14px 16px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Total</td>
              {[totals.revenue, totals.material, totals.labour, totals.design, totals.overhead, totalCost].map((v, vi) => (
                <td key={vi} style={{ ...serif, fontSize: 14, color: '#e7e5e4', padding: '14px 16px', textAlign: 'right' }}>₹{Math.round(v).toLocaleString('en-IN')}</td>
              ))}
              <td style={{ ...serif, fontSize: 14, color: '#22c55e', padding: '14px 16px', textAlign: 'right' }}>₹{Math.round(totalProfit).toLocaleString('en-IN')}</td>
              <td style={{ ...serif, fontSize: 14, color: gold, padding: '14px 16px', textAlign: 'right' }}>{margin}%</td>
            </tr>
          </tbody>
        </table>
      </Card>

      {/* Cost breakdown chart (CSS bars) */}
      <Card style={{ marginTop: 20 }}>
        <p style={{ ...sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: stone, margin: '0 0 18px' }}>Cost Breakdown — Overall Portfolio</p>
        {[
          { label: 'Material Costs', value: totals.material, color: gold },
          { label: 'Labour',         value: totals.labour,   color: '#78716c' },
          { label: 'Design Fees',    value: totals.design,   color: '#a8a29e' },
          { label: 'Overhead',       value: totals.overhead, color: bdr },
        ].map(item => {
          const pct = ((item.value / totalCost) * 100).toFixed(1)
          return (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <span style={{ ...sans, fontSize: 11, color: stone, width: 110, flexShrink: 0 }}>{item.label}</span>
              <div style={{ flex: 1, height: 20, background: light }}>
                <div style={{ height: '100%', width: `${pct}%`, background: item.color, transition: 'width 0.5s' }} />
              </div>
              <span style={{ ...sans, fontSize: 11, color: dark, width: 80, textAlign: 'right', flexShrink: 0 }}>{pct}% · {fmtINR(item.value)}</span>
            </div>
          )
        })}
      </Card>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'quote',    icon: '◧', label: 'Quote Builder' },
  { id: 'invoices', icon: '◨', label: 'Invoices' },
  { id: 'pl',       icon: '◩', label: 'P & L Report' },
]

export default function FinancialPage() {
  const [tab, setTab]             = useState('quote')
  const [sideCollapsed, setSide]  = useState(false)
  const user = JSON.parse(localStorage.getItem('es_user') || '{"name":"Admin","role":"ADMIN"}')
  const initials = (user.name || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const W = sideCollapsed ? 60 : 220

  return (
    <div style={{ minHeight: '100vh', display: 'flex', ...sans, background: light }}>
      {/* Sidebar */}
      <aside style={{ width: W, background: dark, display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'width 0.22s ease', overflow: 'hidden' }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', gap: 10, padding: sideCollapsed ? '0 15px' : '0 16px', borderBottom: '1px solid #292524', flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, border: `1px solid ${gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 8.5V18H13V12.5H7V18H2V8.5L10 2Z" stroke={gold} strokeWidth="1.3" fill="none" /></svg>
          </div>
          {!sideCollapsed && (
            <div style={{ overflow: 'hidden' }}>
              <p style={{ ...serif, margin: 0, fontSize: 15, fontWeight: 500, color: '#fff', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>El Shaddai</p>
              <p style={{ margin: 0, fontSize: 8, color: gold, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 1 }}>Financial</p>
            </div>
          )}
          <button onClick={() => setSide(c => !c)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#57534e', cursor: 'pointer', fontSize: 14, padding: 4 }}>{sideCollapsed ? '»' : '«'}</button>
        </div>

        <nav style={{ flex: 1, padding: '10px 6px', overflowY: 'auto' }}>
          {TABS.map(t => {
            const active = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)} title={t.label}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: sideCollapsed ? '10px 15px' : '9px 12px', background: active ? 'rgba(201,162,39,0.08)' : 'transparent', border: 'none', borderLeft: `2px solid ${active ? gold : 'transparent'}`, color: active ? gold : '#78716c', cursor: 'pointer', textAlign: 'left', ...sans, fontSize: 11, fontWeight: active ? 600 : 400, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 1, whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{t.icon}</span>
                {!sideCollapsed && <span>{t.label}</span>}
              </button>
            )
          })}
        </nav>

        <div style={{ padding: sideCollapsed ? '10px 6px' : '10px 8px', borderTop: '1px solid #292524' }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: sideCollapsed ? '8px 15px' : '8px 12px', color: '#78716c', textDecoration: 'none', ...sans, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap', marginBottom: 2 }}>
            <span style={{ fontSize: 13 }}>◁</span>{!sideCollapsed && <span>Dashboards</span>}
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <header style={{ height: 60, background: '#fff', borderBottom: `1px solid ${bdr}`, display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, flexShrink: 0 }}>
          <p style={{ ...serif, margin: 0, fontSize: 22, fontWeight: 300, color: dark }}>{TABS.find(t => t.id === tab)?.label}</p>
          <div style={{ flex: 1 }} />
          <span style={{ ...sans, fontSize: 10, color: '#a8a29e', fontWeight: 300, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Financial Management</span>
          <div style={{ width: 32, height: 32, background: gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: '#000' }}>{initials}</div>
        </header>
        <main style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
          {tab === 'quote'    && <QuoteBuilder />}
          {tab === 'invoices' && <InvoicesTab />}
          {tab === 'pl'       && <PLTab />}
        </main>
      </div>
    </div>
  )
}
