import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProducts } from '../services/productService'
import { addToCart } from '../services/cartService'

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0))

const getProductId = (product) =>
  product.productId || product.id || product._id || product.name

function ProductDetailsPage({ isAdmin, cartCount, refreshCartCount, onLogout }) {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [cartStatus, setCartStatus] = useState({ type: '', message: '' })
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadProduct = async () => {
      setIsLoading(true)
      setError('')

      try {
        const products = await getProducts()
        const foundProduct = products.find((p) => String(getProductId(p)) === id)

        if (isMounted) {
          if (foundProduct) {
            setProduct(foundProduct)
          } else {
            setError('Product not found.')
          }
        }
      } catch (error) {
        if (isMounted) {
          setError(error.message || 'Unable to load product details.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    if (id) {
      loadProduct()
    }

    return () => {
      isMounted = false
    }
  }, [id])

  if (isLoading) {
    return (
      <main className="product-details-page">
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
        <div className="product-details-container">
          <p className="loading-message">Loading product details...</p>
        </div>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="product-details-page">
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
        <div className="product-details-container">
          <div className="error-section">
            <h1>Product Not Found</h1>
            <p>{error || 'The product you are looking for does not exist.'}</p>
            <Link to="/" className="back-link">
              ← Back to Products
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const quantity = Number(product.quantity || 0)

  const handleAddToCart = async () => {
    if (!product) {
      return
    }

    setIsAddingToCart(true)
    setCartStatus({ type: '', message: '' })

    try {
      await addToCart(Number(getProductId(product)), 1)
      setCartStatus({ type: 'success', message: 'Added to cart.' })
      if (typeof refreshCartCount === 'function') {
        await refreshCartCount()
      }
    } catch (addError) {
      setCartStatus({
        type: 'error',
        message: addError.message || 'Unable to add product to cart.',
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <main className="product-details-page">
      <header className="store-header">
        <Link className="store-brand" to="/">
          ProductHub
        </Link>
        <nav className="store-nav" aria-label="Primary navigation">
          {isAdmin ? <Link to="/dashboard">📈 Admin Panel</Link> : null}
          <Link to="/cart" className="cart-link">
            Cart{cartCount > 0 ? ` (${cartCount})` : ''}
          </Link>
          <button type="button" onClick={onLogout} aria-label="Logout">
            Logout
          </button>
        </nav>
      </header>

      <div className="product-details-container">
        <nav className="breadcrumb">
          <Link to="/">🏠 Home</Link>
          <span>/</span>
          <Link to="/">📦 Products</Link>
          <span>/</span>
          <span>{product.name || 'Product Details'}</span>
        </nav>

        <div className="product-details-content">
          <div className="product-gallery">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name || 'Product'}
                className="product-main-image"
              />
            ) : (
              <div className="product-image-fallback">
                {(product.name || 'P').charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="product-info">
            <div className="product-header">
              <span className="product-category">
                📂 {product.category || 'Uncategorized'}
              </span>
              <h1>{product.name || 'Untitled product'}</h1>
              <div className="product-price-section">
                <strong className="product-price">💰 {formatCurrency(product.price)}</strong>
              </div>
            </div>

            <div className="product-description-section">
              <h2>📝 Description</h2>
              <p className="product-description">
                {product.description || 'No description available for this product.'}
              </p>
            </div>

            <div className="product-actions">
              <button
                type="button"
                className="add-to-cart-btn"
                disabled={quantity === 0 || isAddingToCart}
                onClick={handleAddToCart}
              >
                {isAddingToCart ? '⏳ Adding...' : quantity > 0 ? '🛒 Add to Cart' : 'Unavailable'}
              </button>
              <button type="button" className="wishlist-btn">
                ❤️ Add to Wishlist
              </button>
            </div>
            {cartStatus.message ? (
              <p className={`form-status ${cartStatus.type}`}>
                {cartStatus.type === 'success' ? '✅' : '❌'} {cartStatus.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="product-specifications">
          <h2>Product Details</h2>
          <div className="specs-grid">
            <div className="spec-item">
              <span className="spec-label">Product ID</span>
              <span className="spec-value">{getProductId(product)}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Category</span>
              <span className="spec-value">{product.category || 'N/A'}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Price</span>
              <span className="spec-value">{formatCurrency(product.price)}</span>
            </div>
            {product.brand && (
              <div className="spec-item">
                <span className="spec-label">Brand</span>
                <span className="spec-value">{product.brand}</span>
              </div>
            )}
            {product.sku && (
              <div className="spec-item">
                <span className="spec-label">SKU</span>
                <span className="spec-value">{product.sku}</span>
              </div>
            )}
          </div>
        </div>

        <div className="related-products">
          <h2>More Products</h2>
          <p>Check out other products in our catalog.</p>
          <Link to="/" className="view-all-link">
            View All Products →
          </Link>
        </div>
      </div>
    </main>
  )
}

export default ProductDetailsPage