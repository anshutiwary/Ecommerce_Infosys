import axios from 'axios'
import { normalizeOrderPayload } from '../utils/orderStatus'

const CHECKOUT_API_URL = '/api/checkout'

function getApiErrorMessage(error, fallbackMessage) {
  const response = error.response?.data
  if (response?.validationErrors) {
    return Object.values(response.validationErrors)[0] || response.message || fallbackMessage
  }
  return response?.message || error.message || fallbackMessage
}

export async function checkoutCart(payload) {
  try {
    const response = await axios.post(CHECKOUT_API_URL, payload, {
      withCredentials: true,
    })

    return normalizeOrderPayload(response.data)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to complete checkout.'))
  }
}
