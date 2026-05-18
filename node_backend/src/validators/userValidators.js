import { body } from 'express-validator'

export const updateProfileValidations = [
  body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 chars')
]

export const updatePasswordValidations = [
  body('currentPassword').exists().withMessage('Current password required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 chars')
]
