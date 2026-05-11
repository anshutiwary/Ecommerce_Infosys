import axios from 'axios'

const CHECKOUT_API_URL = '/api/checkout'

function getApiErrorMessage(error, fallbackMessage) {
  return error.response?.data?.message || error.message || fallbackMessage
}

export async function checkoutCart(shippingAddress = '', paymentMethod = '') {
  try {
    const response = await axios.post(
      CHECKOUT_API_URL,
      { shippingAddress, paymentMethod },
      { withCredentials: true },
    )

    return response.data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to complete checkout.'))
  }
}
