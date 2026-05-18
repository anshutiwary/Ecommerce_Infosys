import bcrypt from 'bcrypt'
import User from '../models/User.js'
import { createAccessToken, createRefreshToken, verifyRefreshToken } from '../utils/jwt.js'

const SALT_ROUNDS = 10

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' })
    }
    const hashed = await bcrypt.hash(password, SALT_ROUNDS)
    const user = await User.create({ name, email, password: hashed })

    const accessToken = createAccessToken({ userId: user._id })
    const refreshToken = createRefreshToken({ userId: user._id })

    user.refreshTokens.push({ token: refreshToken })
    await user.save()

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.COOKIE_SECURE === 'true', sameSite: 'lax' })
    res.status(201).json({ accessToken, user: { id: user._id, name: user.name, email: user.email } })
  } catch (err) {
    next(err)
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const accessToken = createAccessToken({ userId: user._id })
    const refreshToken = createRefreshToken({ userId: user._id })

    user.refreshTokens.push({ token: refreshToken })
    await user.save()

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.COOKIE_SECURE === 'true', sameSite: 'lax' })
    res.json({ accessToken, user: { id: user._id, name: user.name, email: user.email } })
  } catch (err) {
    next(err)
  }
}

export async function refreshToken(req, res, next) {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken
    if (!token) return res.status(401).json({ message: 'Refresh token required' })

    const payload = await verifyRefreshToken(token)
    if (!payload) return res.status(401).json({ message: 'Invalid refresh token' })

    const user = await User.findById(payload.userId)
    if (!user) return res.status(401).json({ message: 'Invalid refresh token' })

    const hasToken = user.refreshTokens.some(rt => rt.token === token)
    if (!hasToken) return res.status(401).json({ message: 'Refresh token not recognised' })

    const newAccess = createAccessToken({ userId: user._id })
    res.json({ accessToken: newAccess })
  } catch (err) {
    next(err)
  }
}

export async function logout(req, res, next) {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken
    if (!token) return res.status(204).send()

    const payload = await verifyRefreshToken(token)
    if (!payload) {
      res.clearCookie('refreshToken')
      return res.status(204).send()
    }

    await User.updateOne({ _id: payload.userId }, { $pull: { refreshTokens: { token } } })
    res.clearCookie('refreshToken')
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
