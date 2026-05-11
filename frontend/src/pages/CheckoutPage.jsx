import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCart } from '../services/cartService'
import { checkoutCart } from '../services/checkoutService'

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0))

const getProductId = (product) =>
  product.productId || product.id || product._id || product.name

const paymentOptions = [
  'Credit Card',
  'Debit Card',
  'UPI',
  'Cash on Delivery',
]

function CheckoutPage({ isAdmin, cartCount, refreshCartCount, onLogout }) {
  const [cartItems, setCartItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [shippingAddress, setShippingAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const loadCart = async () => {
    setIsLoading(true)
    setError('')

    try {
      const cart = await getCart()
      setCartItems(cart)
      if (typeof refreshCartCount === 'function') {
        await refreshCartCount()
      }
    } catch (loadError) {
      setError(loadError.message || 'Unable to load cart items.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const loadInitialCart = async () => {
      setIsLoading(true)
      setError('')

      try {
        const cart = await getCart()

        if (isMounted) {
          setCartItems(cart)
          if (typeof refreshCartCount === 'function') {
            await refreshCartCount()
          }
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || 'Unable to load cart items.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadInitialCart()

    return () => {
      isMounted = false
    }
  }, [refreshCartCount])

  const cartTotal = useMemo(
    () =>
      cartItems.reduce((sum, cartItem) => {
        const product = cartItem.product || {}
        return sum + Number(product.price || 0) * Number(cartItem.quantity || 0)
      }, 0),
    [cartItems],
  )

  const handleCheckout = async () => {
    setIsCheckingOut(true)
    setError('')

    try {
      const order = await checkoutCart(shippingAddress.trim(), paymentMethod)
      await loadCart()
      setCartItems([])
      navigate('/order-confirmation', { state: { order } })
    } catch (checkoutError) {
      setError(checkoutError.message || 'Unable to complete checkout.')
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <main className="checkout-page">
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
            <p>Checkout</p>
            <h1>Review your order</h1>
          </div>
          <Link to="/cart" className="view-all-link">
            Back to cart
          </Link>
        </div>

        {isLoading ? (
          <p className="product-message">Loading checkout...</p>
        ) : (
          <div className="checkout-layout">
            <section className="checkout-items-panel">
              <div className="checkout-section-heading">
                <h2>Cart items</h2>
                <span>{cartItems.length} item{cartItems.length === 1 ? '' : 's'}</span>
              </div>

              {error ? <p className="product-message error">{error}</p> : null}

              {!cartItems.length ? (
                <div className="checkout-empty-state">
                  <h3>Your cart is empty</h3>
                  <p>Add products to your cart before checking out.</p>
                  <Link to="/" className="view-all-link">
                    Shop products
                  </Link>
                </div>
              ) : (
                <div className="checkout-item-list">
                  {cartItems.map((cartItem) => {
                    const product = cartItem.product || {}
                    const productId = getProductId(product)
                    const quantity = Number(cartItem.quantity || 0)
                    const unitPrice = Number(product.price || 0)
                    const subtotal = unitPrice * quantity

                    return (
                      <article className="checkout-item" key={productId}>
                        <div>
                          <h3>{product.name || 'Untitled product'}</h3>
                          <p>Quantity: {quantity}</p>
                        </div>
                        <div className="checkout-item-money">
                          <span>{formatCurrency(unitPrice)} each</span>
                          <strong>{formatCurrency(subtotal)}</strong>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </section>

            <aside className="checkout-summary-panel">
              <h2>Payment summary</h2>

              <label className="checkout-address-field">
                Shipping address
                <textarea
                  rows="4"
                  value={shippingAddress}
                  onChange={(event) => setShippingAddress(event.target.value)}
                  placeholder="House number, street, city, state"
                />
              </label>

              <label className="payment-method-field">
                Payment method
                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                >
                  <option value="">Select payment method</option>
                  {paymentOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <div className="checkout-total-row">
                <span>Total amount</span>
                <strong>{formatCurrency(cartTotal)}</strong>
              </div>

              <button
                type="button"
                className="checkout-button"
                onClick={handleCheckout}
                disabled={!cartItems.length || !shippingAddress.trim() || !paymentMethod || isCheckingOut}
              >
                {isCheckingOut ? 'Placing order...' : 'Place order'}
              </button>
            </aside>
          </div>
        )}

      </div>
    </main>
  )
}

export default CheckoutPage
