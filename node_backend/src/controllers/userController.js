import bcrypt from 'bcrypt'
import User from '../models/User.js'

export async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user.userId).select('-password -refreshTokens')
    res.json({ user })
  } catch (err) {
    next(err)
  }
}

export async function updateProfile(req, res, next) {
  try {
    const updates = {}
    if (req.body.name) updates.name = req.body.name

    const updated = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).select('-password -refreshTokens')
    res.json({ user: updated })
  } catch (err) {
    next(err)
  }
}

export async function updatePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const match = await bcrypt.compare(currentPassword, user.password)
    if (!match) return res.status(401).json({ message: 'Current password incorrect' })

    const hashed = await bcrypt.hash(newPassword, 10)
    user.password = hashed
    await user.save()
    res.status(200).json({ message: 'Password updated' })
  } catch (err) {
    next(err)
  }
}
