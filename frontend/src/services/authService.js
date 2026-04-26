const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/users'
const AUTH_VERIFY_URL = import.meta.env.VITE_AUTH_VERIFY_URL || `${API_BASE_URL}/me`

export async function verifyStoredSession() {
  const response = await fetch(AUTH_VERIFY_URL, {
    method: 'GET',
    credentials: 'include',
  })

  let data = null

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Session verification failed.')
  }

  return data || { message: 'Session verified.' }
}

export async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    credentials: 'include',
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
    credentials: 'include',
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

  return data || { message: 'Login successful.' }
}

export async function logoutUser() {
  await fetch(`${API_BASE_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
  })
}
