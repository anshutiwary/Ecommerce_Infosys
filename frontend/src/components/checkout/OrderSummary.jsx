const summaryRows = [
  { key: 'subtotal', label: 'Total price' },
  { key: 'taxes', label: 'Taxes' },
  { key: 'deliveryCharges', label: 'Delivery charges' },
]

function OrderSummary({
  pricing,
  formatCurrency,
  itemCount,
  canSubmit,
  isSubmitting,
  onSubmit,
}) {
  return (
    <div className="checkout-summary-card">
      <div className="checkout-summary-lines" aria-label="Order summary">
        {summaryRows.map((row) => (
          <div className="checkout-summary-row" key={row.key}>
            <span>{row.label}</span>
            <strong>{formatCurrency(pricing[row.key])}</strong>
          </div>
        ))}

        <div className="checkout-summary-row checkout-summary-row-total">
          <span>Grand total</span>
          <strong>{formatCurrency(pricing.grandTotal)}</strong>
        </div>
      </div>

      <p className="checkout-summary-note">
        {itemCount} item{itemCount === 1 ? '' : 's'} ready for checkout
      </p>

      <button
        type="button"
        className="checkout-button"
        onClick={onSubmit}
        disabled={!canSubmit || isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? 'Placing order...' : 'Place order'}
      </button>
    </div>
  )
}

export default OrderSummary
