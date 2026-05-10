import axios from 'axios'

const ORDERS_API_URL = '/api/orders'

function getApiErrorMessage(error, fallbackMessage) {
  return error.response?.data?.message || error.message || fallbackMessage
}

export async function getMyOrders() {
  try {
    const response = await axios.get(ORDERS_API_URL, {
      withCredentials: true,
    })

    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to load your orders.'))
  }
}
