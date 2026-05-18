import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../services/productService'
import { addToCart } from '../services/cartService'
import { getProductImageUrl } from '../utils/productImages'

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0))

const getProductId = (product) =>
  product.productId || product.id || product._id || product.name

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Newest First', value: 'newest' },
]

function HomePage({ isAdmin, cartCount, refreshCartCount, onLogout }) {
  const [products, setProducts] = useState([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [productError, setProductError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  const [addingProductId, setAddingProductId] = useState(null)
  const [cartStatus, setCartStatus] = useState({ productId: null, type: '', message: '' })

  useEffect(() => {
    let isMounted = true

    const loadProducts = async () => {
      setIsLoadingProducts(true)
      setProductError('')

      try {
        const productList = await getProducts()

        if (isMounted) {
          setProducts(productList)
        }
      } catch (error) {
        if (isMounted) {
          setProductError(error.message || 'Unable to load products.')
        }
      } finally {
        if (isMounted) {
          setIsLoadingProducts(false)
        }
      }
    }

    loadProducts()

    return () => {
      isMounted = false
    }
  }, [])

  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      products
        .map((product) => product.category?.trim())
        .filter(Boolean),
    )

    return Array.from(uniqueCategories).sort((first, second) =>
      first.localeCompare(second),
    )
  }, [products])

  const categoryHighlights = categories.slice(0, 6)

  const filteredProducts = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase()
    const priceLimit = Number(maxPrice || 0)

    const matchingProducts = products.filter((product) => {
      const productName = product.name || ''
      const productDescription = product.description || ''
      const productCategory = product.category || ''
      const productPrice = Number(product.price || 0)

      const matchesSearch =
        !normalizedSearchTerm ||
        [productName, productDescription, productCategory]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearchTerm)

      const matchesCategory =
        categoryFilter === 'all' || productCategory === categoryFilter

      const matchesPrice = !priceLimit || productPrice <= priceLimit

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice
      )
    })

    return [...matchingProducts].sort((firstProduct, secondProduct) => {
      if (sortBy === 'price-asc') {
        return Number(firstProduct.price || 0) - Number(secondProduct.price || 0)
      }

      if (sortBy === 'price-desc') {
        return Number(secondProduct.price || 0) - Number(firstProduct.price || 0)
      }

      if (sortBy === 'newest') {
        return String(getProductId(secondProduct)).localeCompare(
          String(getProductId(firstProduct)),
        )
      }

      return 0
    })
  }, [
    categoryFilter,
    maxPrice,
    products,
    searchTerm,
    sortBy,
  ])

  const hasActiveFilters =
    searchTerm.trim() ||
    categoryFilter !== 'all' ||
    maxPrice ||
    sortBy !== 'featured'

  const clearFilters = () => {
    setSearchTerm('')
    setCategoryFilter('all')
    setMaxPrice('')
    setSortBy('featured')
  }

  const handleAddToCart = async (product) => {
    const productId = getProductId(product)
    if (!productId) {
      return
    }

    setAddingProductId(productId)
    setCartStatus({ productId, type: '', message: '' })

    try {
      await addToCart(Number(productId), 1)
      if (typeof refreshCartCount === 'function') {
        await refreshCartCount()
      }
      setCartStatus({ productId, type: 'success', message: 'Product added to cart.' })
    } catch (error) {
      setCartStatus({
        productId,
        type: 'error',
        message: error.message || 'Unable to add product to cart.',
      })
    } finally {
      setAddingProductId(null)
    }
  }

  return (
    <main className="home-page">
      <header className="store-header">
        <Link className="store-brand" to="/">
          ProductHub
        </Link>
        <label className="store-search">
          <input
            type="search"
            placeholder="🔍 Search products..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Search products"
          />
        </label>
        <nav className="store-nav" aria-label="Primary navigation">
          {isAdmin ? <Link to="/dashboard">📈 Admin Panel</Link> : null}
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

      <section className="store-hero">
        <div>
          <p>✨ Today's selection</p>
          <h1>🎯 Discover products for every requirement.</h1>
          <span>
            Browse the catalog with fast search and practical filters.
          </span>
        </div>
      </section>

      {categoryHighlights.length ? (
        <section className="category-strip" aria-label="Featured categories">
          {categoryHighlights.map((category) => (
            <button
              key={category}
              type="button"
              className={categoryFilter === category ? 'active' : ''}
              onClick={() => setCategoryFilter(category)}
              title={`Filter by ${category}`}
            >
              {category}
            </button>
          ))}
        </section>
      ) : null}

      <section className="store-layout" aria-labelledby="catalog-heading">
        <aside className="store-sidebar" aria-label="Product filters">
          <div className="store-filter-header">
            <h2>🎚️ Filters</h2>
            <button type="button" onClick={clearFilters} disabled={!hasActiveFilters}>
              Clear
            </button>
          </div>

          <label>
            <span>📁 Category</span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span> Max price</span>
            <input
              type="number"
              min="0"
              placeholder="5000"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              aria-label="Filter by max price"
            />
          </label>
        </aside>

        <section className="store-catalog">
          <div className="catalog-toolbar">
            <div>
              <h2 id="catalog-heading">📦 Product Listing</h2>
              <p>
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>
            <label>
              <span>Sort by</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                aria-label="Sort products"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isLoadingProducts ? (
            <p className="product-message">⏳ Loading products...</p>
          ) : productError ? (
            <p className="product-message error">❌ {productError}</p>
          ) : filteredProducts.length ? (
            <div className="store-grid">
              {filteredProducts.map((product) => {
                const productImageUrl = getProductImageUrl(product)

                return (
                  <article className="store-card" key={getProductId(product)}>
                    {productImageUrl ? (
                      <img src={productImageUrl} alt={product.name || 'Product'} />
                    ) : (
                      <div className="product-image-fallback">
                        {(product.name || 'P').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="store-card-body">
                      <p className="product-category">
                        {product.category || 'Uncategorized'}
                      </p>
                      <h3>{product.name || 'Untitled product'}</h3>
                      <p className="product-description">
                        {product.description || 'No description available.'}
                      </p>
                      <strong>{formatCurrency(product.price)}</strong>
                      <div className="store-card-actions">
                        <button
                          type="button"
                          className="primary-button"
                          disabled={Number(product.quantity || 0) === 0 || addingProductId === getProductId(product)}
                          onClick={() => handleAddToCart(product)}
                        >
                          {addingProductId === getProductId(product)
                            ? 'Adding...'
                            : Number(product.quantity || 0) > 0
                              ? '🛒 Add to Cart'
                              : 'Unavailable'}
                        </button>
                        <Link
                          to={`/product/${getProductId(product)}`}
                          className="view-details-link"
                          title="View product details"
                        >
                          View Details
                        </Link>
                      </div>
                      {cartStatus.productId === getProductId(product) && cartStatus.message ? (
                        <p className={`form-status ${cartStatus.type}`}>
                          {cartStatus.message}
                        </p>
                      ) : null}
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <p className="product-message">
              🔍 No products match your search and filters.
            </p>
          )}
        </section>
      </section>
    </main>
  )
}

export default HomePage
