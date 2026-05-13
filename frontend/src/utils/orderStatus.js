const ORDER_STATUS_FALLBACK = 'CONFIRMED'

const legacyApprovalStatuses = new Set([
  'APPROVED',
  'AWAITING_APPROVAL',
  'PENDING',
  'PENDING_APPROVAL',
  'WAITING_FOR_ADMIN_APPROVAL',
])

const placedStatuses = new Set([
  'ORDER_PLACED',
  'PLACED',
  'SUCCESS',
  'SUCCESSFUL',
])

const statusLabels = {
  CANCELLED: 'Cancelled',
  CANCELED: 'Cancelled',
  CONFIRMED: 'Order Confirmed',
  DELIVERED: 'Delivered',
  FAILED: 'Payment Failed',
  PLACED: 'Order Placed Successfully',
  PROCESSING: 'Processing',
  REFUNDED: 'Refunded',
  SHIPPED: 'Shipped',
}

export function normalizeOrderPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return payload
  }

  return payload.order || payload.data?.order || payload.data || payload
}

export function normalizeOrdersPayload(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (!payload || typeof payload !== 'object') {
    return []
  }

  if (Array.isArray(payload.orders)) {
    return payload.orders
  }

  if (Array.isArray(payload.data)) {
    return payload.data
  }

  if (Array.isArray(payload.data?.orders)) {
    return payload.data.orders
  }

  return []
}

export function getOrderStatus(order) {
  const rawStatus = String(
    order?.orderStatus || order?.status || order?.checkoutStatus || '',
  )
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')

  if (!rawStatus || legacyApprovalStatuses.has(rawStatus) || rawStatus === 'ORDER_CONFIRMED') {
    return ORDER_STATUS_FALLBACK
  }

  if (placedStatuses.has(rawStatus)) {
    return 'PLACED'
  }

  return rawStatus
}

export function getOrderStatusLabel(order) {
  const status = getOrderStatus(order)

  return statusLabels[status] || status.replace(/_/g, ' ')
}

export function getOrderStatusClass(order) {
  return getOrderStatus(order).toLowerCase().replace(/_/g, '-')
}
