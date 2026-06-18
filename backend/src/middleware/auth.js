import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken ||
      req.headers.authorization?.replace('Bearer ', '')

    if (!token) return res.status(401).json({ error: 'Authentication required' })

    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user    = await prisma.user.findUnique({ where: { id: payload.sub } })

    if (!user) return res.status(401).json({ error: 'User not found' })

    req.user = user
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role))
    return res.status(403).json({ error: 'Insufficient permissions' })
  next()
}

export const optionalAuth = async (req, _res, next) => {
  try {
    const token = req.cookies?.accessToken ||
      req.headers.authorization?.replace('Bearer ', '')
    if (token) {
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await prisma.user.findUnique({ where: { id: payload.sub } })
    }
  } catch { /* continue without user */ }
  next()
}
