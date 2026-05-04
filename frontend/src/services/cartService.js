const CART_API_BASE_URL = '/api/cart'

async function parseJsonResponse(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function getCart() {
  const response = await fetch(CART_API_BASE_URL, {
    method: 'GET',
    credentials: 'include',
  })

  const data = await parseJsonResponse(response)

  if (!response.ok) {
    throw new Error(data?.message || 'Unable to load cart.')
  }

  return Array.isArray(data) ? data : []
}

export async function addToCart(productId, quantity = 1) {
  const response = await fetch(CART_API_BASE_URL, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productId, quantity }),
  })

  const data = await parseJsonResponse(response)

  if (!response.ok) {
    throw new Error(data?.message || 'Unable to add item to cart.')
  }

  return data
}

export async function updateCartQuantity(productId, quantity) {
  const response = await fetch(`${CART_API_BASE_URL}/${encodeURIComponent(productId)}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(quantity),
  })

  const data = await parseJsonResponse(response)

  if (!response.ok) {
    throw new Error(data?.message || 'Unable to update cart item quantity.')
  }

  return data
}

export async function removeFromCart(productId) {
  const response = await fetch(`${CART_API_BASE_URL}/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  const data = await parseJsonResponse(response)

  if (!response.ok) {
    throw new Error(data?.message || 'Unable to remove item from cart.')
  }

  return data
}
