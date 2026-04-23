const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/users'
const AUTH_TOKEN_STORAGE_KEY = 'authBearerToken'

const getTokenFromPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return ''
  }

  const token =
    payload.token ||
    payload.accessToken ||
    payload.jwt ||
    payload?.data?.token ||
    payload?.data?.accessToken ||
    ''

  return typeof token === 'string' ? token.trim().replace(/^Bearer\s+/i, '') : ''
}

export function getStoredBearerToken() {
  if (typeof window === 'undefined') {
    return ''
  }

  const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)

  return token ? `Bearer ${token}` : ''
}

export function clearStoredBearerToken() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
}

export async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })

  let data = null

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Registration request failed.')
  }

  return data || { message: 'Registration successful.' }
}

export async function loginUser(credentials) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  let data = null

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Login request failed.')
  }

  const token = getTokenFromPayload(data)

  if (token && typeof window !== 'undefined') {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
  }

  return data || { message: 'Login successful.' }
}
