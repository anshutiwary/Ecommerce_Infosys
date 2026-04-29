const PRODUCT_API_BASE_URL =
  import.meta.env.VITE_PRODUCT_API_BASE_URL || '/api/products'

async function parseJsonResponse(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

function normalizeProducts(data) {
  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.products)) {
    return data.products
  }

  if (Array.isArray(data?.data)) {
    return data.data
  }

  return []
}

function normalizeProduct(data, fallbackProduct = {}) {
  return data?.product || data?.data || data || fallbackProduct
}

function getProductEndpoint(productId) {
  return `${PRODUCT_API_BASE_URL}/${encodeURIComponent(productId)}`
}

export async function getProducts() {
  const response = await fetch(PRODUCT_API_BASE_URL, {
    method: 'GET',
    credentials: 'include',
  })

  const data = await parseJsonResponse(response)

  if (!response.ok) {
    throw new Error(data?.message || 'Unable to load products.')
  }

  return normalizeProducts(data)
}

export async function addProduct(productData) {
  const response = await fetch(PRODUCT_API_BASE_URL, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  })

  const data = await parseJsonResponse(response)

  if (!response.ok) {
    throw new Error(data?.message || 'Unable to add product.')
  }

  return normalizeProduct(data, productData)
}

export async function updateProduct(productId, productData) {
  const response = await fetch(getProductEndpoint(productId), {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  })

  const data = await parseJsonResponse(response)

  if (!response.ok) {
    throw new Error(data?.message || 'Unable to update product.')
  }

  return normalizeProduct(data, { ...productData, id: productId })
}

export async function deleteProduct(productId) {
  const response = await fetch(getProductEndpoint(productId), {
    method: 'DELETE',
    credentials: 'include',
  })

  const data = await parseJsonResponse(response)

  if (!response.ok) {
    throw new Error(data?.message || 'Unable to delete product.')
  }

  return data
}
