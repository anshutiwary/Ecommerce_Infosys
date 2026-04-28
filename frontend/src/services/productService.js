const PRODUCT_API_BASE_URL =
  import.meta.env.VITE_PRODUCT_API_BASE_URL || '/api/products'

export async function getProducts() {
  const response = await fetch(PRODUCT_API_BASE_URL, {
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
    throw new Error(data?.message || 'Unable to load products.')
  }

  return Array.isArray(data) ? data : []
}
