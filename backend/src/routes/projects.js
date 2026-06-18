import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = Router()
const prisma = new PrismaClient()

/* ── Create project from wizard ── */
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { name, propertyType, area, areaUnit, rooms, budget, style, city, address, aiDesignData } = req.body

  const project = await prisma.project.create({
    data: {
      userId: req.user.id,
      name: name || `My ${style} ${propertyType} Project`,
      propertyType: propertyType.toUpperCase().replace(/ /g, '_'),
      area: parseFloat(area),
      areaUnit: areaUnit || 'sqft',
      rooms: Array.isArray(rooms) ? rooms : [rooms],
      budget: parseFloat(budget),
      style,
      city,
      address,
      aiDesignData: aiDesignData || null,
      status: 'WIZARD_COMPLETE',
    }
  })

  /* Emit to admin dashboard via socket */
  req.app.get('io')?.emit('project:new', { projectId: project.id, userId: req.user.id })

  res.status(201).json({ project })
}))

/* ── List user's projects ── */
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query
  const where = { userId: req.user.id, ...(status && { status }) }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where, orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit, take: parseInt(limit),
      include: { quotation: { select: { total: true, status: true } } }
    }),
    prisma.project.count({ where })
  ])

  res.json({ projects, total, page: parseInt(page), pages: Math.ceil(total / limit) })
}))

/* ── Get single project ── */
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const project = await prisma.project.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: {
      quotation: true,
      order: { include: { timeline: { orderBy: { createdAt: 'asc' } } } }
    }
  })
  if (!project) return res.status(404).json({ error: 'Project not found' })
  res.json({ project })
}))

/* ── Update project status ── */
router.patch('/:id/status', authenticate, asyncHandler(async (req, res) => {
  const { status } = req.body
  const project = await prisma.project.update({
    where: { id: req.params.id },
    data: { status }
  })

  req.app.get('io')?.to(`project:${req.params.id}`).emit('project:status', { status })
  res.json({ project })
}))

/* ── Save 3D scene ── */
router.patch('/:id/scene', authenticate, asyncHandler(async (req, res) => {
  const { sceneId, thumbnailUrl } = req.body
  const project = await prisma.project.update({
    where: { id: req.params.id },
    data: { sceneId, thumbnailUrl, status: 'DESIGN_IN_PROGRESS' }
  })
  res.json({ project })
}))

/* ── Delete project ── */
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  await prisma.project.deleteMany({ where: { id: req.params.id, userId: req.user.id } })
  res.json({ message: 'Project deleted' })
}))

export default router
