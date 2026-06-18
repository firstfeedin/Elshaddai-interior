import { logger } from '../utils/logger.js'

export const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`)

    /* Join project room for live updates */
    socket.on('join:project', (projectId) => {
      socket.join(`project:${projectId}`)
      logger.info(`Socket ${socket.id} joined project:${projectId}`)
    })

    /* Join order room for tracking updates */
    socket.on('join:order', (orderId) => {
      socket.join(`order:${orderId}`)
    })

    /* Real-time 3D scene collaboration */
    socket.on('scene:update', ({ projectId, delta }) => {
      socket.to(`project:${projectId}`).emit('scene:delta', delta)
    })

    socket.on('scene:cursor', ({ projectId, position, userId }) => {
      socket.to(`project:${projectId}`).emit('scene:cursor', { position, userId })
    })

    /* Designer chat */
    socket.on('chat:message', ({ projectId, message, sender }) => {
      io.to(`project:${projectId}`).emit('chat:message', {
        message, sender, timestamp: new Date().toISOString()
      })
    })

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`)
    })
  })
}
