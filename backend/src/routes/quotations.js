import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, requireRole } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = Router()
const prisma = new PrismaClient()

router.post('/', authenticate, requireRole('ADMIN','DESIGNER'), asyncHandler(async (req, res) => {
  const { projectId, lineItems, notes } = req.body

  const subtotal = lineItems.reduce((sum, i) => sum + i.qty * i.rate, 0)
  const gst      = Math.round(subtotal * 0.18)
  const total    = subtotal + gst

  const quotation = await prisma.quotation.create({
    data: {
      projectId, lineItems, subtotal, gst, total, notes,
      validTill: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: 'SENT'
    }
  })

  await prisma.project.update({ where: { id: projectId }, data: { status: 'QUOTATION_SENT' } })

  req.app.get('io')?.to(`project:${projectId}`).emit('quotation:sent', { total })

  res.status(201).json({ quotation })
}))

router.get('/:projectId', authenticate, asyncHandler(async (req, res) => {
  const quotation = await prisma.quotation.findFirst({
    where: { projectId: req.params.projectId },
    include: { project: { select: { name: true, userId: true } } }
  })
  if (!quotation) return res.status(404).json({ error: 'Quotation not found' })
  if (quotation.project.userId !== req.user.id && !['ADMIN','DESIGNER'].includes(req.user.role))
    return res.status(403).json({ error: 'Access denied' })
  res.json({ quotation })
}))

router.patch('/:id/accept', authenticate, asyncHandler(async (req, res) => {
  const quotation = await prisma.quotation.update({
    where: { id: req.params.id },
    data: { status: 'ACCEPTED' }
  })
  await prisma.project.update({ where: { id: quotation.projectId }, data: { status: 'PAYMENT_DONE' } })
  res.json({ quotation })
}))

export default router
