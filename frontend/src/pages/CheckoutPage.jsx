import { Component, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CheckoutEmptyState from '../components/checkout/CheckoutEmptyState'
import CheckoutItem from '../components/checkout/CheckoutItem'
import OrderSummary from '../components/checkout/OrderSummary'
import { getCart } from '../services/cartService'
import { checkoutCart } from '../services/checkoutService'
import { getProfile } from '../services/userService'

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0))

const getProductId = (product) =>
  product.productId || product.id || product._id || product.name

const paymentOptions = [
  { label: 'Cash on Delivery', value: 'CASH_ON_DELIVERY' },
  { label: 'Credit Card', value: 'CREDIT_CARD' },
  { label: 'Debit Card', value: 'DEBIT_CARD' },
  { label: 'UPI', value: 'UPI' },
  { label: 'Net Banking', value: 'NET_BANKING' },
  { label: 'Wallet', value: 'WALLET' },
]

const requiredShippingFields = [
  'fullName',
  'phone',
  'addressLine1',
  'city',
  'state',
  'postalCode',
  'country',
]

const TAX_RATE = 0.18
const DELIVERY_CHARGE = 199
const FREE_DELIVERY_THRESHOLD = 50000

const emptyShippingAddress = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
}

const getProfilePayload = (data) => data?.user || data?.data?.user || data?.data || data || {}

const normalizeSavedAddress = (data) => {
  const address = data?.address || data?.shippingAddress || data?.defaultAddress || data || {}

  return {
    fullName: address.fullName || address.name || data?.name || '',
    phone: address.phone || data?.phone || '',
    addressLine1: address.addressLine1 || address.line1 || address.street || '',
    addressLine2: address.addressLine2 || address.line2 || address.landmark || '',
    city: address.city || '',
    state: address.state || '',
    postalCode: address.postalCode || address.zipCode || address.pincode || '',
    country: address.country || 'India',
  }
}

const getCheckoutPricing = (cartItems) => {
  const subtotal = cartItems.reduce((sum, cartItem) => {
    const product = cartItem.product || {}
    return sum + Number(product.price || 0) * Number(cartItem.quantity || 0)
  }, 0)
  const taxes = subtotal * TAX_RATE
  const deliveryCharges =
    subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE
  const grandTotal = subtotal + taxes + deliveryCharges

  return {
    subtotal,
    taxes,
    deliveryCharges,
    grandTotal,
  }
}

class CheckoutErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || 'Something went wrong.' }
  }

  componentDidCatch(error, info) {
    console.error('Checkout page error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="checkout-page">
          <header className="store-header">
            <Link className="store-brand" to="/">
              ProductHub
            </Link>
          </header>
          <div className="checkout-shell">
            <div className="checkout-header">
              <div>
                <p>Checkout</p>
                <h1>Something went wrong</h1>
              </div>
            </div>
            <section className="checkout-items-panel">
              <p className="product-message error">
                {this.state.errorMessage}. Please refresh the page or return to the cart.
              </p>
              <Link to="/cart" className="view-all-link">
                Back to cart
              </Link>
            </section>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}

function CheckoutPage({ currentUser, isAdmin, cartCount, refreshCartCount, onLogout }) {
  const [cartItems, setCartItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [shippingAddress, setShippingAddress] = useState(emptyShippingAddress)
  const [paymentDetails, setPaymentDetails] = useState({
    paymentMethod: 'CASH_ON_DELIVERY',
    cardholderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    upiId: '',
    bankName: '',
    walletProvider: '',
  })
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true

    const loadInitialCart = async () => {
      setIsLoading(true)
      setError('')

      try {
        const [cart, profileResult] = await Promise.allSettled([getCart(), getProfile()])

        if (cart.status === 'rejected') {
          throw cart.reason
        }

        if (isMounted) {
          setCartItems(cart.value)

          if (profileResult.status === 'fulfilled') {
            setShippingAddress((currentAddress) => ({
              ...currentAddress,
              ...normalizeSavedAddress(getProfilePayload(profileResult.value)),
            }))
          }

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

  const pricing = useMemo(() => getCheckoutPricing(cartItems), [cartItems])
  const shippingValidationErrors = getShippingValidationErrors()
  const paymentValidationErrors = getPaymentValidationErrors()
  const cartValidationError = getCartValidationError()
  const canSubmit =
    cartItems.length > 0 &&
    !Object.keys(shippingValidationErrors).length &&
    !Object.keys(paymentValidationErrors).length &&
    !cartValidationError &&
    !isCheckingOut

  const handleShippingChange = (field, value) => {
    setShippingAddress((currentAddress) => ({
      ...currentAddress,
      [field]: value,
    }))
  }

  const handlePaymentChange = (field, value) => {
    setPaymentDetails((currentDetails) => ({
      ...currentDetails,
      [field]: value,
    }))
  }

  const normalizeUserName = (user) => {
    if (!user) {
      return ''
    }

    if (typeof user.name === 'string' && user.name.trim()) {
      return user.name.trim()
    }

    if (typeof user.fullName === 'string' && user.fullName.trim()) {
      return user.fullName.trim()
    }

    const firstName = user.firstName || user.first_name || ''
    const lastName = user.lastName || user.last_name || ''

    return `${firstName} ${lastName}`.trim()
  }

  function getShippingValidationErrors() {
    const errors = {}

    requiredShippingFields.forEach((field) => {
      const value = shippingAddress[field]?.trim() || ''
      if (!value) {
        errors[field] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())} is required.`
      }
    })

    if (shippingAddress.phone && !/^[0-9+\-\s()]{7,20}$/.test(shippingAddress.phone.trim())) {
      errors.phone = 'Phone number is invalid.'
    }

    if (
      shippingAddress.postalCode &&
      !/^[A-Za-z0-9\-\s]{3,12}$/.test(shippingAddress.postalCode.trim())
    ) {
      errors.postalCode = 'Postal code is invalid.'
    }

    return errors
  }

  function getPaymentValidationErrors() {
    const errors = {}

    if (!paymentDetails.paymentMethod) {
      errors.paymentMethod = 'Payment method is required.'
      return errors
    }

    if (['CREDIT_CARD', 'DEBIT_CARD'].includes(paymentDetails.paymentMethod)) {
      if (!paymentDetails.cardholderName.trim()) {
        errors.cardholderName = 'Cardholder name is required.'
      }
      if (!/^[0-9]{12,19}$/.test(paymentDetails.cardNumber.trim())) {
        errors.cardNumber = 'Card number is invalid.'
      }
      if (!paymentDetails.expiryMonth || paymentDetails.expiryMonth < 1 || paymentDetails.expiryMonth > 12) {
        errors.expiryMonth = 'Expiry month is invalid.'
      }
      if (
        !paymentDetails.expiryYear ||
        paymentDetails.expiryYear < 2000 ||
        paymentDetails.expiryYear > 2100
      ) {
        errors.expiryYear = 'Expiry year is invalid.'
      }
      if (!/^[0-9]{3,4}$/.test(paymentDetails.cvv.trim())) {
        errors.cvv = 'CVV is invalid.'
      }
    }

    if (paymentDetails.paymentMethod === 'UPI') {
      if (!/^[A-Za-z0-9._%+-]{2,}@[A-Za-z0-9.-]{2,}$/.test(paymentDetails.upiId.trim())) {
        errors.upiId = 'UPI ID is invalid.'
      }
    }

    if (paymentDetails.paymentMethod === 'NET_BANKING' && !paymentDetails.bankName.trim()) {
      errors.bankName = 'Bank name is required for net banking.'
    }

    if (paymentDetails.paymentMethod === 'WALLET' && !paymentDetails.walletProvider.trim()) {
      errors.walletProvider = 'Wallet provider is required.'
    }

    return errors
  }

  function getCartValidationError() {
    if (!cartItems.length) {
      return 'Your cart is empty. Add items before placing an order.'
    }

    const invalidItem = cartItems.find(
      (item) => !Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0,
    )

    if (invalidItem) {
      return 'One or more cart items have invalid quantities.'
    }

    if (pricing.grandTotal <= 0) {
      return 'Order total must be greater than zero.'
    }

    return ''
  }

  const handleCheckout = async () => {
    const shippingValidationErrors = getShippingValidationErrors()
    const paymentValidationErrors = getPaymentValidationErrors()
    const cartValidationError = getCartValidationError()

    if (Object.keys(shippingValidationErrors).length || Object.keys(paymentValidationErrors).length || cartValidationError) {
      setError(cartValidationError || 'Complete the shipping and payment details to proceed.')
      return
    }

    setIsCheckingOut(true)
    setError('')
    setSuccessMessage('')

    const sanitizedShippingAddress = Object.fromEntries(
      Object.entries(shippingAddress).map(([key, value]) => [key, value.trim()]),
    )

    const sanitizedPaymentDetails = {
      ...paymentDetails,
      cardholderName: paymentDetails.cardholderName.trim(),
      cardNumber: paymentDetails.cardNumber.trim(),
      expiryMonth: paymentDetails.expiryMonth ? Number(paymentDetails.expiryMonth) : undefined,
      expiryYear: paymentDetails.expiryYear ? Number(paymentDetails.expiryYear) : undefined,
      cvv: paymentDetails.cvv.trim(),
      upiId: paymentDetails.upiId.trim(),
      bankName: paymentDetails.bankName.trim(),
      walletProvider: paymentDetails.walletProvider.trim(),
    }

    const payload = {
      shippingAddress: sanitizedShippingAddress,
      paymentDetails: sanitizedPaymentDetails,
      cartItems: cartItems.map((cartItem) => {
        const product = cartItem.product || {}
        return {
          productId: getProductId(product),
          name: product.name || 'Unknown product',
          quantity: Number(cartItem.quantity || 0),
          unitPrice: Number(product.price || 0),
          subtotal: Number(product.price || 0) * Number(cartItem.quantity || 0),
        }
      }),
      userDetails: {
        id: currentUser?.id || currentUser?.userId || currentUser?.uid || null,
        name: normalizeUserName(currentUser),
        email: currentUser?.email || currentUser?.username || null,
      },
      orderSummary: {
        subtotal: pricing.subtotal,
        taxes: pricing.taxes,
        deliveryCharges: pricing.deliveryCharges,
        grandTotal: pricing.grandTotal,
        itemCount: cartItems.length,
      },
      totalAmount: pricing.grandTotal,
    }

    try {
      const order = await checkoutCart(payload)
      setSuccessMessage('Order placed successfully.')
      setCartItems([])
      if (typeof refreshCartCount === 'function') {
        await refreshCartCount()
      }
      navigate('/order-confirmation', {
        state: {
          order,
          successMessage: 'Order placed successfully.',
        },
      })
    } catch (checkoutError) {
      setError(checkoutError.message || 'Unable to complete checkout.')
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <CheckoutErrorBoundary>
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
              {successMessage ? (
                <p className="product-message success">{successMessage}</p>
              ) : null}

              {!cartItems.length ? (
                <CheckoutEmptyState />
              ) : (
                <div className="checkout-item-list">
                  {cartItems.map((cartItem) => {
                    const product = cartItem.product || {}
                    const productId = getProductId(product)

                    return (
                      <CheckoutItem
                        key={productId}
                        cartItem={cartItem}
                        formatCurrency={formatCurrency}
                        getProductId={getProductId}
                      />
                    )
                  })}
                </div>
              )}
            </section>

            <aside className="checkout-summary-panel">
              <h2>Payment summary</h2>

              <div className="checkout-field-group">
                <h3>Shipping address</h3>
                <label className="checkout-address-field">
                  Full name
                  <input
                    type="text"
                    value={shippingAddress.fullName}
                    onChange={(event) => handleShippingChange('fullName', event.target.value)}
                    autoComplete="name"
                  />
                  {shippingValidationErrors.fullName ? (
                    <span className="field-error">{shippingValidationErrors.fullName}</span>
                  ) : null}
                </label>
                <label className="checkout-address-field">
                  Phone
                  <input
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(event) => handleShippingChange('phone', event.target.value)}
                    autoComplete="tel"
                  />
                  {shippingValidationErrors.phone ? (
                    <span className="field-error">{shippingValidationErrors.phone}</span>
                  ) : null}
                </label>
                <label className="checkout-address-field checkout-field-wide">
                  Address line 1
                  <input
                    type="text"
                    value={shippingAddress.addressLine1}
                    onChange={(event) => handleShippingChange('addressLine1', event.target.value)}
                    autoComplete="address-line1"
                  />
                  {shippingValidationErrors.addressLine1 ? (
                    <span className="field-error">{shippingValidationErrors.addressLine1}</span>
                  ) : null}
                </label>
                <label className="checkout-address-field checkout-field-wide">
                  Address line 2
                  <input
                    type="text"
                    value={shippingAddress.addressLine2}
                    onChange={(event) => handleShippingChange('addressLine2', event.target.value)}
                    autoComplete="address-line2"
                  />
                </label>
                <label className="checkout-address-field">
                  City
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(event) => handleShippingChange('city', event.target.value)}
                    autoComplete="address-level2"
                  />
                  {shippingValidationErrors.city ? (
                    <span className="field-error">{shippingValidationErrors.city}</span>
                  ) : null}
                </label>
                <label className="checkout-address-field">
                  State
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(event) => handleShippingChange('state', event.target.value)}
                    autoComplete="address-level1"
                  />
                  {shippingValidationErrors.state ? (
                    <span className="field-error">{shippingValidationErrors.state}</span>
                  ) : null}
                </label>
                <label className="checkout-address-field">
                  Postal code
                  <input
                    type="text"
                    value={shippingAddress.postalCode}
                    onChange={(event) => handleShippingChange('postalCode', event.target.value)}
                    autoComplete="postal-code"
                  />
                  {shippingValidationErrors.postalCode ? (
                    <span className="field-error">{shippingValidationErrors.postalCode}</span>
                  ) : null}
                </label>
                <label className="checkout-address-field">
                  Country
                  <input
                    type="text"
                    value={shippingAddress.country}
                    onChange={(event) => handleShippingChange('country', event.target.value)}
                    autoComplete="country-name"
                  />
                  {shippingValidationErrors.country ? (
                    <span className="field-error">{shippingValidationErrors.country}</span>
                  ) : null}
                </label>
              </div>

              <label className="payment-method-field">
                Payment method
                <select
                  value={paymentDetails.paymentMethod}
                  onChange={(event) => handlePaymentChange('paymentMethod', event.target.value)}
                >
                  {paymentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {paymentValidationErrors.paymentMethod ? (
                  <span className="field-error">{paymentValidationErrors.paymentMethod}</span>
                ) : null}
              </label>

              {['CREDIT_CARD', 'DEBIT_CARD'].includes(paymentDetails.paymentMethod) ? (
                <div className="checkout-field-group">
                  <label className="checkout-address-field checkout-field-wide">
                    Cardholder name
                    <input
                      type="text"
                      value={paymentDetails.cardholderName}
                      onChange={(event) =>
                        handlePaymentChange('cardholderName', event.target.value)
                      }
                      autoComplete="cc-name"
                    />
                    {paymentValidationErrors.cardholderName ? (
                      <span className="field-error">{paymentValidationErrors.cardholderName}</span>
                    ) : null}
                  </label>
                  <label className="checkout-address-field checkout-field-wide">
                    Card number
                    <input
                      type="text"
                      inputMode="numeric"
                      value={paymentDetails.cardNumber}
                      onChange={(event) => handlePaymentChange('cardNumber', event.target.value)}
                      autoComplete="cc-number"
                    />
                    {paymentValidationErrors.cardNumber ? (
                      <span className="field-error">{paymentValidationErrors.cardNumber}</span>
                    ) : null}
                  </label>
                  <label className="checkout-address-field">
                    Expiry month
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={paymentDetails.expiryMonth}
                      onChange={(event) => handlePaymentChange('expiryMonth', event.target.value)}
                      autoComplete="cc-exp-month"
                    />
                    {paymentValidationErrors.expiryMonth ? (
                      <span className="field-error">{paymentValidationErrors.expiryMonth}</span>
                    ) : null}
                  </label>
                  <label className="checkout-address-field">
                    Expiry year
                    <input
                      type="number"
                      min="2026"
                      max="2100"
                      value={paymentDetails.expiryYear}
                      onChange={(event) => handlePaymentChange('expiryYear', event.target.value)}
                      autoComplete="cc-exp-year"
                    />
                    {paymentValidationErrors.expiryYear ? (
                      <span className="field-error">{paymentValidationErrors.expiryYear}</span>
                    ) : null}
                  </label>
                  <label className="checkout-address-field">
                    CVV
                    <input
                      type="password"
                      inputMode="numeric"
                      value={paymentDetails.cvv}
                      onChange={(event) => handlePaymentChange('cvv', event.target.value)}
                      autoComplete="cc-csc"
                    />
                    {paymentValidationErrors.cvv ? (
                      <span className="field-error">{paymentValidationErrors.cvv}</span>
                    ) : null}
                  </label>
                </div>
              ) : null}

              {paymentDetails.paymentMethod === 'UPI' ? (
                <label className="checkout-address-field">
                  UPI ID
                  <input
                    type="text"
                    value={paymentDetails.upiId}
                    onChange={(event) => handlePaymentChange('upiId', event.target.value)}
                    placeholder="name@bank"
                  />
                  {paymentValidationErrors.upiId ? (
                    <span className="field-error">{paymentValidationErrors.upiId}</span>
                  ) : null}
                </label>
              ) : null}

              {paymentDetails.paymentMethod === 'NET_BANKING' ? (
                <label className="checkout-address-field">
                  Bank name
                  <input
                    type="text"
                    value={paymentDetails.bankName}
                    onChange={(event) => handlePaymentChange('bankName', event.target.value)}
                  />
                  {paymentValidationErrors.bankName ? (
                    <span className="field-error">{paymentValidationErrors.bankName}</span>
                  ) : null}
                </label>
              ) : null}

              {paymentDetails.paymentMethod === 'WALLET' ? (
                <label className="checkout-address-field">
                  Wallet provider
                  <input
                    type="text"
                    value={paymentDetails.walletProvider}
                    onChange={(event) =>
                      handlePaymentChange('walletProvider', event.target.value)
                    }
                  />
                  {paymentValidationErrors.walletProvider ? (
                    <span className="field-error">{paymentValidationErrors.walletProvider}</span>
                  ) : null}
                </label>
              ) : null}

              <OrderSummary
                pricing={pricing}
                formatCurrency={formatCurrency}
                itemCount={cartItems.length}
                canSubmit={Boolean(canSubmit)}
                isSubmitting={isCheckingOut}
                onSubmit={handleCheckout}
              />
            </aside>
          </div>
        )}
      </div>
      </main>
    </CheckoutErrorBoundary>
  )
}

export default CheckoutPage
