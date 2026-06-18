import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, requireRole } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = Router()
const prisma = new PrismaClient()

router.use(authenticate, requireRole('ADMIN'))

/* ── Dashboard stats ── */
router.get('/stats', asyncHandler(async (_req, res) => {
  const [users, projects, consultations, orders] = await Promise.all([
    prisma.user.count(),
    prisma.project.groupBy({ by: ['status'], _count: true }),
    prisma.consultation.groupBy({ by: ['status'], _count: true }),
    prisma.order.aggregate({ _sum: { amount: true }, _count: true }),
  ])

  res.json({
    totalUsers:     users,
    projectsByStatus: Object.fromEntries(projects.map(p => [p.status, p._count])),
    leadsByStatus:    Object.fromEntries(consultations.map(c => [c.status, c._count])),
    totalOrders:    orders._count,
    totalRevenue:   orders._sum.amount || 0,
  })
}))

/* ── All projects ── */
router.get('/projects', asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query
  const where = status ? { status } : {}
  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where, include: { user: { select: { name: true, email: true, phone: true } }, quotation: true },
      orderBy: { updatedAt: 'desc' }, skip: (page-1)*limit, take: parseInt(limit)
    }),
    prisma.project.count({ where })
  ])
  res.json({ projects, total })
}))

/* ── All users ── */
router.get('/users', asyncHandler(async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id:true, name:true, email:true, phone:true, role:true, city:true, createdAt:true, _count: { select: { projects: true } } }
  })
  res.json({ users })
}))

/* ── Update user role ── */
router.patch('/users/:id/role', asyncHandler(async (req, res) => {
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { role: req.body.role } })
  res.json({ user: { id: user.id, name: user.name, role: user.role } })
}))

export default router
