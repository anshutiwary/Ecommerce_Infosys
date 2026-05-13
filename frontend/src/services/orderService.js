import axios from 'axios'
import { normalizeOrdersPayload } from '../utils/orderStatus'

const ORDERS_API_URL = '/api/orders'

function getApiErrorMessage(error, fallbackMessage) {
  return error.response?.data?.message || error.message || fallbackMessage
}

export async function getMyOrders() {
  try {
    const response = await axios.get(ORDERS_API_URL, {
      withCredentials: true,
    })

    return normalizeOrdersPayload(response.data)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to load your orders.'))
  }
}
