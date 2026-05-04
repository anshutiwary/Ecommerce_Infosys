import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getCart,
  removeFromCart,
  updateCartQuantity,
} from '../services/cartService'

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0))

const getProductId = (product) =>
  product.productId || product.id || product._id || product.name

function CartPage({ isAdmin, cartCount, refreshCartCount, onLogout }) {
  const [cartItems, setCartItems] = useState([])
  const [quantities, setQuantities] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState({ type: '', message: '' })
  const [updatingItemId, setUpdatingItemId] = useState(null)
  const [removingItemId, setRemovingItemId] = useState(null)

  useEffect(() => {
    let isMounted = true

    const loadCart = async () => {
      setIsLoading(true)
      setError('')
      setActionMessage({ type: '', message: '' })

      try {
        const cart = await getCart()

        if (isMounted) {
          setCartItems(cart)
          setQuantities(
            cart.reduce((acc, cartItem) => {
              const product = cartItem.product || {}
              acc[getProductId(product)] = Number(cartItem.quantity || 1)
              return acc
            }, {}),
          )
          if (typeof refreshCartCount === 'function') {
            refreshCartCount()
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

    loadCart()

    return () => {
      isMounted = false
    }
  }, [refreshCartCount])

  const cartTotal = cartItems.reduce((sum, cartItem) => {
    const product = cartItem.product || {}
    return sum + Number(product.price || 0) * Number(cartItem.quantity || 0)
  }, 0)

  const handleQuantityChange = (productId, nextValue) => {
    const nextQuantity = Math.max(1, Number(nextValue) || 1)
    setQuantities((current) => ({
      ...current,
      [productId]: nextQuantity,
    }))
  }

  const handleUpdateQuantity = async (productId) => {
    const quantity = Number(quantities[productId] || 1)
    setUpdatingItemId(productId)
    setActionMessage({ type: '', message: '' })

    try {
      await updateCartQuantity(productId, quantity)
      setCartItems((currentItems) =>
        currentItems.map((item) => {
          const product = item.product || {}
          return getProductId(product) === productId
            ? { ...item, quantity }
            : item
        }),
      )
      setActionMessage({ type: 'success', message: 'Cart updated successfully.' })
    } catch (updateError) {
      setActionMessage({
        type: 'error',
        message: updateError.message || 'Unable to update cart item quantity.',
      })
    } finally {
      setUpdatingItemId(null)
    }
  }

  const handleRemoveItem = async (productId) => {
    setRemovingItemId(productId)
    setActionMessage({ type: '', message: '' })

    try {
      await removeFromCart(productId)
      setCartItems((currentItems) =>
        currentItems.filter((item) => {
          const product = item.product || {}
          return getProductId(product) !== productId
        }),
      )
      setActionMessage({ type: 'success', message: 'Item removed from cart.' })
      if (typeof refreshCartCount === 'function') {
        refreshCartCount()
      }
    } catch (removeError) {
      setActionMessage({
        type: 'error',
        message: removeError.message || 'Unable to remove cart item.',
      })
    } finally {
      setRemovingItemId(null)
    }
  }

  return (
    <main className="cart-page">
      <header className="store-header">
        <Link className="store-brand" to="/">
          ProductHub
        </Link>
        <nav className="store-nav" aria-label="Primary navigation">
          {isAdmin ? <Link to="/dashboard">Admin Panel</Link> : null}
          <Link to="/cart" className="cart-link">
            Cart{cartCount > 0 ? ` (${cartCount})` : ''}
          </Link>
          <button type="button" onClick={onLogout}>
            Logout
          </button>
        </nav>
      </header>

      <div className="cart-page-shell">
        <div className="cart-page-header">
          <div>
            <p>Your shopping cart</p>
            <h1>{cartItems.length} item{cartItems.length === 1 ? '' : 's'}</h1>
          </div>
          <Link to="/" className="view-all-link">
            Continue shopping
          </Link>
        </div>

        {isLoading ? (
          <p className="product-message">Loading your cart...</p>
        ) : error ? (
          <p className="product-message error">{error}</p>
        ) : !cartItems.length ? (
          <section className="cart-empty-state">
            <h2>Your cart is empty</h2>
            <p>Browse products and add what you want to purchase.</p>
            <Link to="/" className="view-all-link">
              Shop products
            </Link>
          </section>
        ) : (
          <>
            {actionMessage.message ? (
              <p className={`product-message ${actionMessage.type}`}>{actionMessage.message}</p>
            ) : null}

            <section className="cart-list">
              {cartItems.map((cartItem) => {
                const product = cartItem.product || {}
                const productId = getProductId(product)
                const quantity = Number(quantities[productId] || cartItem.quantity || 1)
                const subtotal = Number(product.price || 0) * quantity

                return (
                  <article className="cart-item" key={productId}>
                    <div className="cart-item-preview">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name || 'Product'}
                        />
                      ) : (
                        <div className="product-image-fallback">
                          {(product.name || 'P').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="cart-item-details">
                      <Link to={`/product/${productId}`} className="cart-item-name">
                        {product.name || 'Untitled product'}
                      </Link>
                      <p className="product-category">
                        {product.category || 'Uncategorized'}
                      </p>
                      <p className="cart-item-price">
                        {formatCurrency(product.price)} each
                      </p>

                      <label className="cart-quantity-label">
                        Quantity
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(event) =>
                            handleQuantityChange(productId, event.target.value)
                          }
                        />
                      </label>

                      <div className="cart-item-actions">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(productId)}
                          disabled={updatingItemId === productId}
                        >
                          {updatingItemId === productId ? 'Updating...' : 'Update'}
                        </button>
                        <button
                          type="button"
                          className="danger-button"
                          onClick={() => handleRemoveItem(productId)}
                          disabled={removingItemId === productId}
                        >
                          {removingItemId === productId ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    </div>

                    <div className="cart-item-total">
                      <span>Total</span>
                      <strong>{formatCurrency(subtotal)}</strong>
                    </div>
                  </article>
                )
              })}
            </section>

            <section className="cart-summary">
              <div>
                <p>Cart subtotal</p>
                <strong>{formatCurrency(cartTotal)}</strong>
              </div>
              <p>{cartItems.length} item{cartItems.length === 1 ? '' : 's'} in cart</p>
            </section>
          </>
        )}
      </div>
    </main>
  )
}

export default CartPage
