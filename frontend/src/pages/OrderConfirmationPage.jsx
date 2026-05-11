import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0))

const formatOrderDate = (value) => {
  if (!value) {
    return 'Date unavailable'
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function OrderConfirmationPage({ isAdmin, cartCount, onLogout }) {
  const location = useLocation()
  const navigate = useNavigate()
  const order = location.state?.order

  useEffect(() => {
    if (!order) {
      navigate('/orders', { replace: true })
    }
  }, [order, navigate])

  if (!order) {
    return null
  }

  const orderDate = order.orderedAt || order.createdAt || order.orderDate
  const paymentMethod = order.paymentMethod || 'Not specified'
  const orderItems = Array.isArray(order.items) ? order.items : []

  return (
    <main className="order-confirmation-page">
      <header className="store-header">
        <Link className="store-brand" to="/">
          ProductHub
        </Link>
        <nav className="store-nav" aria-label="Primary navigation">
          {isAdmin ? <Link to="/dashboard">Admin Panel</Link> : null}
          <Link to="/orders">My Orders</Link>
          <Link to="/cart" className="cart-link">
            Cart{cartCount > 0 ? ` (${cartCount})` : ''}
          </Link>
          <button type="button" onClick={onLogout}>
            Logout
          </button>
        </nav>
      </header>

      <div className="checkout-shell">
        <div className="checkout-header">
          <div>
            <p>Order confirmation</p>
            <h1>Thank you for your purchase</h1>
          </div>
          <Link to="/orders" className="view-all-link">
            View order history
          </Link>
        </div>

        <section className="order-summary-panel">
          <div className="checkout-section-heading">
            <div>
              <p>Order #{order.orderId}</p>
              <h2>{formatOrderDate(orderDate)}</h2>
            </div>
            <span>{order.orderStatus || 'CONFIRMED'}</span>
          </div>

          <div className="order-summary-meta">
            <div>
              <span>Total paid</span>
              <strong>{formatCurrency(order.totalPrice)}</strong>
            </div>
            <div>
              <span>Shipping address</span>
              <strong>{order.shippingAddress || 'Not provided'}</strong>
            </div>
            <div>
              <span>Payment method</span>
              <strong>{paymentMethod}</strong>
            </div>
          </div>

          <div className="checkout-item-list">
            {orderItems.map((item) => (
              <article className="checkout-item" key={item.orderItemId || item.productId}>
                <div>
                  <h3>{item.productName || 'Product'}</h3>
                  <p>Quantity: {item.quantity}</p>
                </div>
                <div className="checkout-item-money">
                  <span>{formatCurrency(item.unitPrice)} each</span>
                  <strong>{formatCurrency(item.subtotal)}</strong>
                </div>
              </article>
            ))}
          </div>

          <div className="checkout-empty-state" style={{ marginTop: '24px' }}>
            <h3>Your order has been placed successfully.</h3>
            <p>Your items will be processed and shipped soon.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/" className="view-all-link">
                Continue shopping
              </Link>
              <Link to="/orders" className="view-all-link">
                See order history
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default OrderConfirmationPage
