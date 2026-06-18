import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { asyncHandler } from '../middleware/errorHandler.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

/* ── Furniture — public list with filters ── */
router.get('/furniture', asyncHandler(async (req, res) => {
  const { category, style, minPrice, maxPrice, inStock, search, page = 1, limit = 24 } = req.query

  const where = {
    ...(category  && { category }),
    ...(inStock   && { inStock: inStock === 'true' }),
    ...(minPrice || maxPrice) && { price: {
      ...(minPrice && { gte: parseFloat(minPrice) }),
      ...(maxPrice && { lte: parseFloat(maxPrice) }),
    }},
    ...(style && { styles: { has: style } }),
    ...(search && {
      OR: [
        { name:        { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags:        { has: search } },
      ]
    }),
  }

  const [items, total] = await Promise.all([
    prisma.furnitureItem.findMany({
      where, orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit, take: parseInt(limit)
    }),
    prisma.furnitureItem.count({ where })
  ])

  res.json({ items, total, page: parseInt(page), pages: Math.ceil(total / limit) })
}))

/* ── Get single furniture item ── */
router.get('/furniture/:id', asyncHandler(async (req, res) => {
  const item = await prisma.furnitureItem.findUnique({ where: { id: req.params.id } })
  if (!item) return res.status(404).json({ error: 'Item not found' })
  res.json({ item })
}))

/* ── Materials library ── */
router.get('/materials', asyncHandler(async (req, res) => {
  const { category, search } = req.query
  const where = {
    ...(category && { category }),
    ...(search && { name: { contains: search, mode: 'insensitive' } })
  }
  const materials = await prisma.material.findMany({ where, orderBy: { category: 'asc' } })
  res.json({ materials })
}))

/* ── Admin CRUD ── */
router.post('/furniture', authenticate, requireRole('ADMIN'), asyncHandler(async (req, res) => {
  const item = await prisma.furnitureItem.create({ data: req.body })
  res.status(201).json({ item })
}))

router.patch('/furniture/:id', authenticate, requireRole('ADMIN'), asyncHandler(async (req, res) => {
  const item = await prisma.furnitureItem.update({ where: { id: req.params.id }, data: req.body })
  res.json({ item })
}))

router.delete('/furniture/:id', authenticate, requireRole('ADMIN'), asyncHandler(async (req, res) => {
  await prisma.furnitureItem.delete({ where: { id: req.params.id } })
  res.json({ message: 'Deleted' })
}))

export default router
