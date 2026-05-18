import jwt from 'jsonwebtoken'
import util from 'util'

const sign = util.promisify(jwt.sign)
const verify = util.promisify(jwt.verify)

export function createAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY || '15m' })
}

export function createRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' })
}

export async function verifyRefreshToken(token) {
  try {
    const payload = await verify(token, process.env.JWT_SECRET)
    return payload
  } catch (err) {
    return null
  }
}
