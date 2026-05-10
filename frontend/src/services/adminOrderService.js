import axios from 'axios'

const ADMIN_ORDERS_API_URL = '/api/admin/orders'

function getApiErrorMessage(error, fallbackMessage) {
  return error.response?.data?.message || error.message || fallbackMessage
}

export async function getAdminOrders() {
  try {
    const response = await axios.get(ADMIN_ORDERS_API_URL, {
      withCredentials: true,
    })

    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to load orders.'))
  }
}

export async function approveOrder(orderId) {
  try {
    const response = await axios.post(
      `${ADMIN_ORDERS_API_URL}/${encodeURIComponent(orderId)}/approve`,
      null,
      { withCredentials: true },
    )

    return response.data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to approve order.'))
  }
}
