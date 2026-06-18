import 'dotenv/config'
import express        from 'express'
import cors           from 'cors'
import helmet         from 'helmet'
import compression    from 'compression'
import morgan         from 'morgan'
import cookieParser   from 'cookie-parser'
import rateLimit      from 'express-rate-limit'
import { createServer }  from 'http'
import { Server as IO }  from 'socket.io'

import authRoutes        from './routes/auth.js'
import projectRoutes     from './routes/projects.js'
import catalogRoutes     from './routes/catalog.js'
import quotationRoutes   from './routes/quotations.js'
import orderRoutes       from './routes/orders.js'
import consultationRoutes from './routes/consultations.js'
import portfolioRoutes   from './routes/portfolio.js'
import aiRoutes          from './routes/ai.js'
import uploadRoutes      from './routes/upload.js'
import adminRoutes       from './routes/admin.js'

import { errorHandler } from './middleware/errorHandler.js'
import { logger }       from './utils/logger.js'
import { registerSocketHandlers } from './services/socket.js'

const app    = express()
const server = createServer(app)
const io     = new IO(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }
})

/* ── Security & middleware ── */
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }))

/* ── Rate limiting ── */
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests' })
app.use('/api', limiter)

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many auth attempts' })
app.use('/api/auth', authLimiter)

/* ── Health check ── */
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    platform: 'El Shaddai Interior Design Platform',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

/* ── API Routes ── */
app.use('/api/auth',          authRoutes)
app.use('/api/projects',      projectRoutes)
app.use('/api/catalog',       catalogRoutes)
app.use('/api/quotations',    quotationRoutes)
app.use('/api/orders',        orderRoutes)
app.use('/api/consultations', consultationRoutes)
app.use('/api/portfolio',     portfolioRoutes)
app.use('/api/ai',            aiRoutes)
app.use('/api/upload',        uploadRoutes)
app.use('/api/admin',         adminRoutes)

/* ── Socket.io ── */
app.set('io', io)
registerSocketHandlers(io)

/* ── Error handler ── */
app.use(errorHandler)

/* ── Start ── */
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  logger.info(`🏠 El Shaddai Backend running on port ${PORT}`)
  logger.info(`📐 Environment: ${process.env.NODE_ENV || 'development'}`)
})

export default app
