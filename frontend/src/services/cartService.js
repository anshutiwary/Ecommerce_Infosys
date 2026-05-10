import axios from 'axios'

const CART_API_BASE_URL = '/api/cart'

function getApiErrorMessage(error, fallbackMessage) {
  return error.response?.data?.message || error.message || fallbackMessage
}

export async function getCart() {
  try {
    const response = await axios.get(CART_API_BASE_URL, {
      withCredentials: true,
    })

    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to load cart.'))
  }
}

export async function addToCart(productId, quantity = 1) {
  try {
    const response = await axios.post(
      CART_API_BASE_URL,
      { productId, quantity },
      { withCredentials: true },
    )

    return response.data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to add item to cart.'))
  }
}

export async function updateCartQuantity(productId, quantity) {
  try {
    const response = await axios.put(
      `${CART_API_BASE_URL}/${encodeURIComponent(productId)}`,
      quantity,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      },
    )

    return response.data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to update cart item quantity.'))
  }
}

export async function removeFromCart(productId) {
  try {
    const response = await axios.delete(
      `${CART_API_BASE_URL}/${encodeURIComponent(productId)}`,
      {
        withCredentials: true,
      },
    )

    return response.data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to remove item from cart.'))
  }
}
