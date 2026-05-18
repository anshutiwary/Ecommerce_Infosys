import express from 'express'
import auth from '../middleware/authMiddleware.js'
import * as userController from '../controllers/userController.js'
import { body } from 'express-validator'
import validate from '../middleware/validate.js'

const router = express.Router()

router.get('/me', auth, userController.getProfile)
router.put('/me', auth, [
  body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 chars'),
], validate, userController.updateProfile)

router.put('/me/password', auth, [
  body('currentPassword').exists(),
  body('newPassword').isLength({ min: 6 })
], validate, userController.updatePassword)

export default router
