import { useState } from 'react'
import { Link } from 'react-router-dom'
import { changePassword } from '../services/userService'
import ToastNotification from '../components/ToastNotification'

function ChangePasswordPage({ cartCount, isAdmin, onLogout }) {
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [status, setStatus] = useState({ type: '', message: '' })
  const [toast, setToast] = useState({ type: '', message: '' })
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
    setStatus({ type: '', message: '' })
  }

  const validateForm = () => {
    if (!formData.currentPassword.trim()) {
      setStatus({ type: 'error', message: 'Current password is required.' })
      return false
    }

    if (formData.newPassword.length < 8) {
      setStatus({ type: 'error', message: 'New password must be at least 8 characters.' })
      return false
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setStatus({ type: 'error', message: 'New passwords do not match.' })
      return false
    }

    return true
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    setStatus({ type: '', message: '' })
    setToast({ type: '', message: '' })

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      })
      setStatus({ type: 'success', message: 'Password updated successfully.' })
      setToast({ type: 'success', message: 'Password updated successfully.' })
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      const message = error.message || 'Unable to update password.'
      setStatus({ type: 'error', message })
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
            <p>Security</p>
            <h1>Change your password</h1>
          </div>
          <Link to="/profile" className="view-all-link">
            Back to profile
          </Link>
        </div>

        <div className="profile-form-card">
          <form onSubmit={handleSubmit} className="profile-form">
            {status.message ? (
              <p className={`profile-status-message ${status.type}`}>{status.message}</p>
            ) : null}

            <label>
              <span>Current password</span>
              <input
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </label>

            <label>
              <span>New password</span>
              <input
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </label>

            <label>
              <span>Confirm new password</span>
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </label>

            <button type="submit" className="primary-button" disabled={isSaving}>
              {isSaving ? 'Updating…' : 'Update password'}
            </button>
          </form>

          <ToastNotification
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ type: '', message: '' })}
          />
        </div>
      </section>
    </main>
  )
}

export default ChangePasswordPage
