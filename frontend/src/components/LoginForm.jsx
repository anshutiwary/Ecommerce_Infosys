import { useState } from 'react'
import { loginUser } from '../services/authService'
import '../styles/register.css'

const initialFormData = {
  email: '',
  password: '',
}

function LoginForm({ onLoginSuccess, onSwitchToRegister }) {
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))

    setErrors((currentErrors) => {
      if (!currentErrors[name]) {
        return currentErrors
      }

      return {
        ...currentErrors,
        [name]: '',
      }
    })

    if (status.message) {
      setStatus({ type: '', message: '' })
    }
  }

  const validateForm = () => {
    const nextErrors = {}

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!formData.password.trim()) {
      nextErrors.password = 'Password is required.'
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setStatus({ type: '', message: '' })

    try {
      const result = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      })

      setErrors({})
      setStatus({
        type: 'success',
        message: result.message || 'Login successful.',
      })
      setFormData(initialFormData)
      onLoginSuccess({
        email: formData.email.trim(),
        ...result,
      })
    } catch (error) {
      console.error(error)
      setStatus({
        type: 'error',
        message: error.message || 'Unable to login right now.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <h2>Login</h2>
        <p>Use your email and password to continue.</p>
      </div>

      <label className="form-field">
        <span>Email</span>
        <input
          type="email"
          name="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email ? <small className="field-error">{errors.email}</small> : null}
      </label>

      <label className="form-field">
        <span>Password</span>
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password ? (
          <small className="field-error">{errors.password}</small>
        ) : null}
      </label>

      {status.message ? (
        <p className={`form-status ${status.type}`}>{status.message}</p>
      ) : null}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Login'}
      </button>

      <p className="form-switch">
        Don&apos;t have an account?{' '}
        <span
          className="form-switch-link"
          role="button"
          tabIndex={0}
          onClick={onSwitchToRegister}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              onSwitchToRegister()
            }
          }}
        >
          Register
        </span>
      </p>
    </form>
  )
}

export default LoginForm
