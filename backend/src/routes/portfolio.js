import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { asyncHandler } from '../middleware/errorHandler.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

router.get('/', asyncHandler(async (req, res) => {
  const { style, category, featured } = req.query
  const where = {
    ...(style    && { style }),
    ...(category && { category }),
    ...(featured && { featured: featured === 'true' }),
  }
  const projects = await prisma.portfolioProject.findMany({
    where, orderBy: [{ featured: 'desc' }, { completedAt: 'desc' }]
  })
  res.json({ projects })
}))

router.post('/', authenticate, requireRole('ADMIN'), asyncHandler(async (req, res) => {
  const project = await prisma.portfolioProject.create({ data: req.body })
  res.status(201).json({ project })
}))

export default router
