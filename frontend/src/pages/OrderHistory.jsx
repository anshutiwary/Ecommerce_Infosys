import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyOrders } from '../services/orderService'
import { getProductImageUrl } from '../utils/productImages'
import { getOrderStatusLabel, getOrderStatusClass } from '../utils/orderStatus'
import Spinner from '../components/Spinner'
import StatusBadge from '../components/StatusBadge'

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

function OrderHistory({ currentUser, cartCount, isAdmin, onLogout }) {
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
          setError(loadError.message || 'Unable to load orders.')
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

  const totalSpent = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
    [orders],
  )

  return (
    <main className="order-history-page">
      <header className="store-header">
        <Link className="store-brand" to="/">
          ProductHub
        </Link>
        <nav className="store-nav" aria-label="Primary navigation">
          {isAdmin ? <Link to="/dashboard">Admin Panel</Link> : null}
          <Link to="/orders">Order History</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/cart" className="cart-link">
            Cart{cartCount > 0 ? ` (${cartCount})` : ''}
          </Link>
          <button type="button" onClick={onLogout} aria-label="Logout">
            Logout
          </button>
        </nav>
      </header>

      <section className="dashboard-shell order-history-shell">
        <div className="checkout-header">
          <div>
            <p>Order history</p>
            <h1>Past purchases</h1>
            <p className="section-subtitle">
              Welcome back, {currentUser?.name || 'customer'}. Review your completed orders below.
            </p>
          </div>
          <Link to="/" className="view-all-link">
            Continue shopping
          </Link>
        </div>

        <section className="order-history-metrics">
          <div>
            <span>Total orders</span>
            <strong>{orders.length}</strong>
          </div>
          <div>
            <span>Total spent</span>
            <strong>{formatCurrency(totalSpent)}</strong>
          </div>
        </section>

        {isLoading ? (
          <Spinner label="Fetching your orders…" />
        ) : error ? (
          <section className="page-error-state">
            <p>{error}</p>
          </section>
        ) : !orders.length ? (
          <section className="checkout-empty-state">
            <h2>No orders yet</h2>
            <p>Once you complete a purchase, your orders will appear here.</p>
            <Link to="/" className="view-all-link">
              Shop products
            </Link>
          </section>
        ) : (
          <section className="order-history-list">
            {orders.map((order) => {
              const items = Array.isArray(order.items) ? order.items : []

              return (
                <article className="order-card" key={order.orderId || order._id}>
                  <div className="order-card-header">
                    <div>
                      <p>Order #{order.orderNumber || order.orderId || order._id}</p>
                      <h2>{formatOrderDate(order.orderedAt)}</h2>
                    </div>
                    <StatusBadge
                      label={getOrderStatusLabel(order)}
                      variant={getOrderStatusClass(order)}
                    />
                  </div>

                  <div className="order-card-meta">
                    <div>
                      <span>Total amount</span>
                      <strong>{formatCurrency(order.totalAmount || order.totalPrice)}</strong>
                    </div>
                    <div>
                      <span>Products</span>
                      <strong>{items.length} item{items.length === 1 ? '' : 's'}</strong>
                    </div>
                    <div>
                      <span>Shipping status</span>
                      <strong>{order.shippingAddress || 'Not provided'}</strong>
                    </div>
                  </div>

                  <div className="order-items-grid">
                    {items.map((item) => (
                      <article
                        className="order-item-card"
                        key={item.orderItemId || item.productId || item.productName}
                      >
                        <div className="order-item-preview">
                          {getProductImageUrl(item) ? (
                            <img
                              src={getProductImageUrl(item)}
                              alt={item.productName || 'Product'}
                              loading="lazy"
                            />
                          ) : (
                            <div className="product-image-fallback">
                              {(item.productName || 'P').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="order-item-copy">
                          <h3>{item.productName || 'Product'}</h3>
                          <p>Quantity: {item.quantity}</p>
                          <span>{formatCurrency(item.unitPrice)} each</span>
                        </div>
                        <strong>{formatCurrency(item.subtotal)}</strong>
                      </article>
                    ))}
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </section>
    </main>
  )
}

export default OrderHistory
