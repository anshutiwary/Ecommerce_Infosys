import { useEffect, useMemo, useState } from 'react'
import { getProducts } from '../services/productService'

const stockFilterOptions = [
  { label: 'All stock', value: 'all' },
  { label: 'In stock', value: 'in-stock' },
  { label: 'Low stock', value: 'low-stock' },
  { label: 'Out of stock', value: 'out-of-stock' },
]

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0))

const getProductId = (product) => product.productId || product.id || product.name

function DashboardPage({ user, onLogout }) {
  const displayName = user?.name || 'User'
  const [products, setProducts] = useState([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [productError, setProductError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')

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

  const filteredProducts = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase()

    return products.filter((product) => {
      const productName = product.name || ''
      const productDescription = product.description || ''
      const productCategory = product.category || ''
      const productQuantity = Number(product.quantity || 0)

      const matchesSearch =
        !normalizedSearchTerm ||
        [productName, productDescription, productCategory]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearchTerm)

      const matchesCategory =
        categoryFilter === 'all' || productCategory === categoryFilter

      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'in-stock' && productQuantity > 5) ||
        (stockFilter === 'low-stock' &&
          productQuantity > 0 &&
          productQuantity <= 5) ||
        (stockFilter === 'out-of-stock' && productQuantity === 0)

      return matchesSearch && matchesCategory && matchesStock
    })
  }, [categoryFilter, products, searchTerm, stockFilter])

  const hasActiveFilters =
    searchTerm.trim() || categoryFilter !== 'all' || stockFilter !== 'all'

  const clearFilters = () => {
    setSearchTerm('')
    setCategoryFilter('all')
    setStockFilter('all')
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-shell">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <button type="button" className="dashboard-logout" onClick={onLogout}>
            Logout
          </button>
        </header>

        <section className="dashboard-hero">
          <p>Welcome back,</p>
          <h2>{displayName}</h2>
          <span>You have successfully logged in.</span>
        </section>

        <section className="product-panel" aria-labelledby="products-heading">
          <div className="product-panel-header">
            <div>
              <h2 id="products-heading">Products</h2>
              <p>
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>
            <button
              type="button"
              className="filter-clear"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
            >
              Clear
            </button>
          </div>

          <div className="product-filters">
            <label className="product-search">
              <span>Search</span>
              <input
                type="search"
                placeholder="Search by name, category, or description"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <label className="product-filter">
              <span>Category</span>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="product-filter">
              <span>Stock</span>
              <select
                value={stockFilter}
                onChange={(event) => setStockFilter(event.target.value)}
              >
                {stockFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isLoadingProducts ? (
            <p className="product-message">Loading products...</p>
          ) : productError ? (
            <p className="product-message error">{productError}</p>
          ) : filteredProducts.length ? (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <article className="product-card" key={getProductId(product)}>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name || 'Product'} />
                  ) : (
                    <div className="product-image-fallback">
                      {(product.name || 'P').charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="product-card-body">
                    <div>
                      <p className="product-category">
                        {product.category || 'Uncategorized'}
                      </p>
                      <h3>{product.name || 'Untitled product'}</h3>
                    </div>
                    <p className="product-description">
                      {product.description || 'No description available.'}
                    </p>
                    <div className="product-meta">
                      <strong>{formatCurrency(product.price)}</strong>
                      <span>{Number(product.quantity || 0)} in stock</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="product-message">
              No products match your search and filters.
            </p>
          )}
        </section>
      </section>
    </main>
  )
}

export default DashboardPage
