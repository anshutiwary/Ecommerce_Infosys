import api from '../api/axiosClient'
import { normalizeOrdersPayload } from '../utils/orderStatus'

const ORDERS_API_URL = '/orders'

function getApiErrorMessage(error, fallbackMessage) {
  return error.response?.data?.message || error.message || fallbackMessage
}

export async function getMyOrders() {
  try {
    const response = await api.get(ORDERS_API_URL)
    return normalizeOrdersPayload(response.data)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to load your orders.'))
  }
}
