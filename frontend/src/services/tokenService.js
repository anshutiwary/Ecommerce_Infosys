const TOKEN_STORAGE_KEY = 'ecom_app_access_token'

const hasWindow = typeof window !== 'undefined'

export function getToken() {
  return hasWindow ? window.sessionStorage.getItem(TOKEN_STORAGE_KEY) : null
}

export function setToken(token) {
  if (!hasWindow || !token) {
    return
  }

  window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function removeToken() {
  if (!hasWindow) {
    return
  }

  window.sessionStorage.removeItem(TOKEN_STORAGE_KEY)
}

export function decodeToken(token) {
  if (!token) {
    return null
  }

  try {
    const payload = token.split('.')[1]
    if (!payload) {
      return null
    }

    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const jsonPayload = decodeURIComponent(
      decoded
        .split('')
        .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join(''),
    )

    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export function isTokenExpired(token) {
  const payload = decodeToken(token)

  if (!payload || !payload.exp) {
    return true
  }

  return Date.now() >= payload.exp * 1000
}
