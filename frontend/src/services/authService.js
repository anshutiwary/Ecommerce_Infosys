import api from '../api/axiosClient'
import { getToken, removeToken, setToken, isTokenExpired } from './tokenService'

const AUTH_BASE_URL = '/users'

function getApiErrorMessage(error, fallbackMessage) {
  return error.response?.data?.message || error.message || fallbackMessage
}

export async function verifyStoredSession() {
  const token = getToken()

  if (!token) {
    return null
  }

  if (isTokenExpired(token)) {
    removeToken()
    throw new Error('Session expired. Please sign in again.')
  }

  try {
    const response = await api.get(`${AUTH_BASE_URL}/me`)
    return response.data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Session verification failed.'))
  }
}

export async function registerUser(userData) {
  try {
    const response = await api.post(`${AUTH_BASE_URL}/register`, userData)
    return response.data || { message: 'Registration successful.' }
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Registration request failed.'))
  }
}

export async function loginUser(credentials) {
  try {
    const response = await api.post(`${AUTH_BASE_URL}/login`, credentials)
    const responseData = response.data || { message: 'Login successful.' }
    const token = responseData.accessToken || responseData.token || responseData.jwt

    if (token) {
      setToken(token)
    }

    return responseData
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Login request failed.'))
  }
}

export async function logoutUser() {
  removeToken()

  try {
    await api.post(`${AUTH_BASE_URL}/logout`)
  } catch {
    // ignore logout network errors when clearing client session
  }
}
