import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyOrders } from '../services/orderService'

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

function MyOrdersPage({ isAdmin, cartCount, onLogout }) {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadOrders = async () => {
      setIsLoading(true)
      setError('')

      try {
        const orderList = await getMyOrders()

        if (isMounted) {
          setOrders(orderList)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || 'Unable to load your orders.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadOrders()

    return () => {
      isMounted = false
    }
  }, [])

  const orderCount = orders.length
  const totalSpent = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0),
    [orders],
  )

  return (
    <main className="my-orders-page">
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

      <div className="my-orders-shell">
        <div className="checkout-header">
          <div>
            <p>My orders</p>
            <h1>Order history</h1>
          </div>
          <Link to="/" className="view-all-link">
            Continue shopping
          </Link>
        </div>

        <section className="my-orders-metrics">
          <div>
            <span>Total orders</span>
            <strong>{orderCount}</strong>
          </div>
          <div>
            <span>Total spent</span>
            <strong>{formatCurrency(totalSpent)}</strong>
          </div>
        </section>

        {isLoading ? (
          <p className="product-message">Loading your orders...</p>
        ) : error ? (
          <p className="product-message error">{error}</p>
        ) : !orders.length ? (
          <section className="checkout-empty-state">
            <h2>No orders yet</h2>
            <p>Your completed checkouts will appear here.</p>
            <Link to="/" className="view-all-link">
              Shop products
            </Link>
          </section>
        ) : (
          <section className="my-orders-list">
            {orders.map((order) => (
              <article className="my-order-card" key={order.orderId}>
                <div className="my-order-card-header">
                  <div>
                    <p>Order #{order.orderId}</p>
                    <h2>{formatOrderDate(order.orderedAt)}</h2>
                  </div>
                  <span>{order.orderStatus || 'PENDING'}</span>
                </div>

                <div className="order-summary-meta">
                  <div>
                    <span>Total amount</span>
                    <strong>{formatCurrency(order.totalPrice)}</strong>
                  </div>
                  <div>
                    <span>Shipping address</span>
                    <strong>{order.shippingAddress || 'Not provided'}</strong>
                  </div>
                </div>

                <div className="checkout-item-list">
                  {(Array.isArray(order.items) ? order.items : []).map((item) => (
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
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}

export default MyOrdersPage
