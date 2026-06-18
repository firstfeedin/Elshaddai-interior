import { Router }   from 'express'
import bcrypt        from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { body, validationResult } from 'express-validator'
import { signAccessToken, signRefreshToken, setAuthCookies, clearAuthCookies } from '../utils/jwt.js'
import { authenticate } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = Router()
const prisma = new PrismaClient()

/* ── Register ── */
router.post('/register',
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password min 8 characters'),
  body('phone').optional().isMobilePhone('any'),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { name, email, password, phone, city } = req.body

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ error: 'Email already registered' })

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, passwordHash, phone, city },
      select: { id: true, name: true, email: true, role: true, avatar: true }
    })

    const accessToken  = signAccessToken(user.id)
    const refreshToken = signRefreshToken()

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    setAuthCookies(res, accessToken, refreshToken)
    res.status(201).json({ user, accessToken })
  })
)

/* ── Login ── */
router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash)
      return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    const accessToken  = signAccessToken(user.id)
    const refreshToken = signRefreshToken()

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7*24*60*60*1000) }
    })

    setAuthCookies(res, accessToken, refreshToken)
    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      accessToken
    })
  })
)

/* ── Refresh token ── */
router.post('/refresh', asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken
  if (!token) return res.status(401).json({ error: 'No refresh token' })

  const stored = await prisma.refreshToken.findUnique({
    where: { token }, include: { user: true }
  })
  if (!stored || stored.expiresAt < new Date())
    return res.status(401).json({ error: 'Invalid or expired refresh token' })

  const accessToken     = signAccessToken(stored.userId)
  const newRefreshToken = signRefreshToken()

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { token: newRefreshToken, expiresAt: new Date(Date.now() + 7*24*60*60*1000) }
  })

  setAuthCookies(res, accessToken, newRefreshToken)
  res.json({ accessToken })
}))

/* ── Logout ── */
router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken
  if (token) await prisma.refreshToken.deleteMany({ where: { token } })
  clearAuthCookies(res)
  res.json({ message: 'Logged out successfully' })
}))

/* ── Me ── */
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, phone: true, role: true, avatar: true, city: true, isVerified: true, createdAt: true }
  })
  res.json({ user })
}))

/* ── Update profile ── */
router.patch('/profile', authenticate, asyncHandler(async (req, res) => {
  const { name, phone, city, avatar } = req.body
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, phone, city, avatar },
    select: { id: true, name: true, email: true, phone: true, role: true, avatar: true, city: true }
  })
  res.json({ user })
}))

export default router
