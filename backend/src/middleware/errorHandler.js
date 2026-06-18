import { logger } from '../utils/logger.js'

export const errorHandler = (err, req, res, _next) => {
  logger.error({ err, url: req.url, method: req.method })

  if (err.name === 'ValidationError')
    return res.status(400).json({ error: err.message, details: err.errors })

  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002')
      return res.status(409).json({ error: 'Record already exists' })
    if (err.code === 'P2025')
      return res.status(404).json({ error: 'Record not found' })
  }

  const status = err.status || err.statusCode || 500
  res.status(status).json({
    error: status < 500 ? err.message : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)
