import express from 'express'
import { body } from 'express-validator'
import * as authController from '../controllers/authController.js'
import validate from '../middleware/validate.js'

const router = express.Router()

router.post('/register', [
  body('name').isLength({ min: 2 }).withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be >= 6 chars')
], validate, authController.register)

router.post('/login', [
  body('email').isEmail(),
  body('password').exists()
], validate, authController.login)

router.post('/refresh', authController.refreshToken)
router.post('/logout', authController.logout)

export default router
