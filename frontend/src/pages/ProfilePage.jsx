import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProfile, updateAddress, updateProfile } from '../services/userService'
import Spinner from '../components/Spinner'
import ToastNotification from '../components/ToastNotification'

const emptyAddress = {
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

const normalizeAddress = (data) => {
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

function ProfilePage({ currentUser, cartCount, isAdmin, onLogout }) {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' })
  const [address, setAddress] = useState(emptyAddress)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAddressSaving, setIsAddressSaving] = useState(false)
  const [toast, setToast] = useState({ type: '', message: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      setIsLoading(true)
      setError('')

      try {
        const data = await getProfile()
        const user = getProfilePayload(data)

        if (isMounted) {
          setProfile({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
          })
          setAddress(normalizeAddress(user))
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || 'Unable to load profile.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setProfile((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleAddressChange = (event) => {
    const { name, value } = event.target
    setAddress((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    setToast({ type: '', message: '' })

    try {
      const updated = await updateProfile(profile)
      setProfile((current) => ({ ...current, ...updated }))
      setToast({ type: 'success', message: 'Profile updated successfully.' })
    } catch (submitError) {
      const message = submitError.message || 'Unable to save profile changes.'
      setError(message)
      setToast({ type: 'error', message })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddressSubmit = async (event) => {
    event.preventDefault()
    setIsAddressSaving(true)
    setError('')
    setToast({ type: '', message: '' })

    const sanitizedAddress = Object.fromEntries(
      Object.entries(address).map(([key, value]) => [key, value.trim()]),
    )

    try {
      const updated = await updateAddress(sanitizedAddress)
      const updatedAddress = getProfilePayload(updated)
      setAddress((current) => ({
        ...current,
        ...sanitizedAddress,
        ...normalizeAddress(updatedAddress),
      }))
      setToast({ type: 'success', message: 'Address updated successfully.' })
    } catch (submitError) {
      const message = submitError.message || 'Unable to save address changes.'
      setError(message)
      setToast({ type: 'error', message })
    } finally {
      setIsAddressSaving(false)
    }
  }

  return (
    <main className="profile-page">
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

      <section className="dashboard-shell profile-shell">
        <div className="checkout-header">
          <div>
            <p>Account settings</p>
            <h1>Update your profile</h1>
            <p className="section-subtitle">
              Logged in as {currentUser?.name || 'your account'}. Keep your contact details current.
            </p>
          </div>
          <Link to="/profile/change-password" className="view-all-link">
            Change password
          </Link>
        </div>

        {isLoading ? (
          <Spinner label="Loading profile…" />
        ) : error ? (
          <section className="page-error-state">
            <p>{error}</p>
          </section>
        ) : (
          <div className="profile-form-card">
            <form onSubmit={handleSubmit} className="profile-form">
              <label>
                <span>Name</span>
                <input
                  name="name"
                  type="text"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  required
                />
              </label>

              <label>
                <span>Email</span>
                <input
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  disabled
                />
              </label>

              <label>
                <span>Phone</span>
                <input
                  name="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                />
              </label>

              <button type="submit" className="primary-button" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save profile'}
              </button>
            </form>

            <form onSubmit={handleAddressSubmit} className="profile-form profile-address-form">
              <div className="profile-form-heading">
                <p>Saved shipping address</p>
                <h2>Address details</h2>
              </div>

              <label>
                <span>Full name</span>
                <input
                  name="fullName"
                  type="text"
                  value={address.fullName}
                  onChange={handleAddressChange}
                  placeholder="Full name"
                  required
                />
              </label>

              <label>
                <span>Phone</span>
                <input
                  name="phone"
                  type="tel"
                  value={address.phone}
                  onChange={handleAddressChange}
                  placeholder="+91 98765 43210"
                  required
                />
              </label>

              <label className="profile-field-wide">
                <span>Address line 1</span>
                <input
                  name="addressLine1"
                  type="text"
                  value={address.addressLine1}
                  onChange={handleAddressChange}
                  placeholder="House number, street"
                  required
                />
              </label>

              <label className="profile-field-wide">
                <span>Address line 2</span>
                <input
                  name="addressLine2"
                  type="text"
                  value={address.addressLine2}
                  onChange={handleAddressChange}
                  placeholder="Area, landmark"
                />
              </label>

              <label>
                <span>City</span>
                <input
                  name="city"
                  type="text"
                  value={address.city}
                  onChange={handleAddressChange}
                  placeholder="City"
                  required
                />
              </label>

              <label>
                <span>State</span>
                <input
                  name="state"
                  type="text"
                  value={address.state}
                  onChange={handleAddressChange}
                  placeholder="State"
                  required
                />
              </label>

              <label>
                <span>Postal code</span>
                <input
                  name="postalCode"
                  type="text"
                  value={address.postalCode}
                  onChange={handleAddressChange}
                  placeholder="Postal code"
                  required
                />
              </label>

              <label>
                <span>Country</span>
                <input
                  name="country"
                  type="text"
                  value={address.country}
                  onChange={handleAddressChange}
                  placeholder="Country"
                  required
                />
              </label>

              <button type="submit" className="primary-button" disabled={isAddressSaving}>
                {isAddressSaving ? 'Saving...' : 'Save address'}
              </button>
            </form>

            <ToastNotification
              message={toast.message}
              type={toast.type}
              onClose={() => setToast({ type: '', message: '' })}
            />
          </div>
        )}
      </section>
    </main>
  )
}

export default ProfilePage
