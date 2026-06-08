import axios from 'axios'
import { getToken, isTokenExpired, removeToken } from '../services/tokenService'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

const AUTH_ENDPOINTS = ['/users/login', '/users/logout', '/users/me']

function isAuthEndpoint(url = '') {
  return AUTH_ENDPOINTS.some((endpoint) => url.endsWith(endpoint))
}

api.interceptors.request.use(
  (config) => {
    const token = getToken()

    if (token) {
      if (isTokenExpired(token)) {
        removeToken()
        window.dispatchEvent(new CustomEvent('authLogout', {
          detail: { reason: 'expired' },
        }))
        return config
      }

      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const requestUrl = error.config?.url || ''

    if (status === 401 && !isAuthEndpoint(requestUrl)) {
      removeToken()
      window.dispatchEvent(new CustomEvent('authLogout', {
        detail: { reason: 'unauthorized' },
      }))
    }

    return Promise.reject(error)
  },
)

export default api
