import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { asyncHandler } from '../middleware/errorHandler.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

/* Public — Book a consultation (landing page form) */
router.post('/', asyncHandler(async (req, res) => {
  const { name, phone, email, city, propertyType, budget, message, source } = req.body
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone required' })

  const consultation = await prisma.consultation.create({
    data: { name, phone, email, city, propertyType, budget, message, source: source || 'website' }
  })

  /* Notify admin in real-time */
  req.app.get('io')?.emit('lead:new', { id: consultation.id, name, phone, city })

  res.status(201).json({ consultation, message: 'Consultation booked! We will call you within 2 hours.' })
}))

/* Admin — List all consultations */
router.get('/', authenticate, requireRole('ADMIN', 'DESIGNER'), asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query
  const where = status ? { status } : {}

  const [consultations, total] = await Promise.all([
    prisma.consultation.findMany({
      where, orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit, take: parseInt(limit)
    }),
    prisma.consultation.count({ where })
  ])

  res.json({ consultations, total })
}))

/* Admin — Update lead status */
router.patch('/:id', authenticate, requireRole('ADMIN', 'DESIGNER'), asyncHandler(async (req, res) => {
  const { status, assignedTo, scheduledAt, notes } = req.body
  const consultation = await prisma.consultation.update({
    where: { id: req.params.id },
    data: { status, assignedTo, scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined, notes }
  })
  res.json({ consultation })
}))

export default router
