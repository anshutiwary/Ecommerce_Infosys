import axios from 'axios'
import { normalizeOrdersPayload } from '../utils/orderStatus'

const ADMIN_ORDERS_API_URL = '/api/admin/orders'

function getApiErrorMessage(error, fallbackMessage) {
  return error.response?.data?.message || error.message || fallbackMessage
}

export async function getAdminOrders() {
  try {
    const response = await axios.get(ADMIN_ORDERS_API_URL, {
      withCredentials: true,
    })

    return normalizeOrdersPayload(response.data)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to load orders.'))
  }
}
