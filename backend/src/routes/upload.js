import { Router } from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { authenticate } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const router  = Router()
const storage = multer.memoryStorage()
const upload  = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } })

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

router.post('/image', authenticate, upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' })

  const b64    = Buffer.from(req.file.buffer).toString('base64')
  const dataUri = `data:${req.file.mimetype};base64,${b64}`

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: 'elshaddai/projects',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }]
  })

  res.json({ url: result.secure_url, publicId: result.public_id })
}))

export default router
