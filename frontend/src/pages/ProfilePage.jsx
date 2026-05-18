import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProfile, updateProfile } from '../services/userService'
import Spinner from '../components/Spinner'
import ToastNotification from '../components/ToastNotification'

function ProfilePage({ currentUser, cartCount, isAdmin, onLogout }) {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [toast, setToast] = useState({ type: '', message: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      setIsLoading(true)
      setError('')

      try {
        const data = await getProfile()

        if (isMounted) {
          setProfile({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
          })
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
    setStatus({ type: '', message: '' })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setStatus({ type: '', message: '' })
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
