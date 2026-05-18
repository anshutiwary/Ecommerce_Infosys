import { body } from 'express-validator'

export const registerValidations = [
  body('name').isLength({ min: 2 }).withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be >= 6 chars')
]

export const loginValidations = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').exists().withMessage('Password required')
]
