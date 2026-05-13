import { Link } from 'react-router-dom'

function CheckoutEmptyState() {
  return (
    <section className="checkout-empty-state" aria-labelledby="checkout-empty-heading">
      <h3 id="checkout-empty-heading">Your cart is empty</h3>
      <p>Add products to your cart before checking out.</p>
      <Link to="/" className="view-all-link">
        Shop products
      </Link>
    </section>
  )
}

export default CheckoutEmptyState
