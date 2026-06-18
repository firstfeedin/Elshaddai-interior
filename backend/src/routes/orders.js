import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, requireRole } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = Router()
const prisma = new PrismaClient()

/* ── Create order after quotation accepted ── */
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { projectId, amount } = req.body

  const order = await prisma.order.create({
    data: {
      userId: req.user.id,
      projectId,
      amount,
      timeline: {
        create: [
          { stage: 'Design Complete',     status: 'completed', completedAt: new Date() },
          { stage: 'Production Started',  status: 'in_progress' },
          { stage: 'Manufacturing',       status: 'pending' },
          { stage: 'Dispatch',            status: 'pending' },
          { stage: 'Installation',        status: 'pending' },
        ]
      }
    },
    include: { timeline: true }
  })

  res.status(201).json({ order })
}))

/* ── Track order ── */
router.get('/:id/track', authenticate, asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: {
      timeline: { orderBy: { createdAt: 'asc' } },
      project: { select: { name: true, style: true, status: true } }
    }
  })
  if (!order) return res.status(404).json({ error: 'Order not found' })
  res.json({ order })
}))

/* ── Admin — Advance tracking stage ── */
router.patch('/:id/stage', authenticate, requireRole('ADMIN', 'ENGINEER'), asyncHandler(async (req, res) => {
  const { stage, status, note } = req.body

  const timeline = await prisma.orderTimeline.updateMany({
    where: { orderId: req.params.id, stage },
    data: { status, note, completedAt: status === 'completed' ? new Date() : undefined }
  })

  /* Push real-time update to client */
  req.app.get('io')?.to(`order:${req.params.id}`).emit('order:update', { stage, status })

  res.json({ timeline })
}))

export default router
