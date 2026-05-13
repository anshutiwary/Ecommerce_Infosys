import { Link } from 'react-router-dom'
import { getProductImageUrl } from '../../utils/productImages'

function CheckoutItem({ cartItem, formatCurrency, getProductId }) {
  const product = cartItem.product || {}
  const productId = getProductId(product)
  const productImageUrl = getProductImageUrl(product)
  const quantity = Number(cartItem.quantity || 0)
  const unitPrice = Number(product.price || 0)
  const subtotal = unitPrice * quantity

  return (
    <article className="checkout-item">
      <Link to={`/product/${productId}`} className="checkout-item-preview" aria-label={product.name || 'View product'}>
        {productImageUrl ? (
          <img src={productImageUrl} alt={product.name || 'Product'} loading="lazy" />
        ) : (
          <div className="product-image-fallback">
            {(product.name || 'P').charAt(0).toUpperCase()}
          </div>
        )}
      </Link>

      <div className="checkout-item-details">
        <Link to={`/product/${productId}`} className="checkout-item-name">
          {product.name || 'Untitled product'}
        </Link>
        <p>{product.category || 'Uncategorized'}</p>
        <div className="checkout-item-meta">
          <span>Qty {quantity}</span>
          <span>{formatCurrency(unitPrice)} each</span>
        </div>
      </div>

      <div className="checkout-item-money">
        <span>Subtotal</span>
        <strong>{formatCurrency(subtotal)}</strong>
      </div>
    </article>
  )
}

export default CheckoutItem
