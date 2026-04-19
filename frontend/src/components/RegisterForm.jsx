import { useState } from 'react'
import { registerUser } from '../services/authService'
import '../styles/register.css'

const initialFormData = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
}

function RegisterForm() {
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

    if (!formData.name.trim()) {
      nextErrors.name = 'Name is required.'
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      nextErrors.phone = 'Phone number must be exactly 10 digits.'
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/

    if (!passwordRegex.test(formData.password)) {
      nextErrors.password =
        'Password must be 8+ characters and include uppercase, lowercase, number, and special character.'
    }

    if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
    }

    setIsSubmitting(true)
    setStatus({ type: '', message: '' })

    try {
      const result = await registerUser(payload)

      setErrors({})
      setStatus({
        type: 'success',
        message: result.message || 'Registration successful.',
      })
      setFormData(initialFormData)
    } catch (error) {
      console.error(error)
      setStatus({
        type: 'error',
        message: error.message || 'Unable to register right now.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <h2>Register</h2>
        <p>Fill in your details below.</p>
      </div>

      <label className="form-field">
        <span>Full Name</span>
        <input
          name="name"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name ? <small className="field-error">{errors.name}</small> : null}
      </label>

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
        <span>Phone Number</span>
        <input
          name="phone"
          inputMode="numeric"
          maxLength="10"
          placeholder="9876543210"
          value={formData.phone}
          onChange={handleChange}
        />
        {errors.phone ? <small className="field-error">{errors.phone}</small> : null}
      </label>

      <label className="form-field">
        <span>Password</span>
        <input
          type="password"
          name="password"
          placeholder="Create a strong password"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password ? (
          <small className="field-error">{errors.password}</small>
        ) : null}
      </label>

      <label className="form-field">
        <span>Confirm Password</span>
        <input
          type="password"
          name="confirmPassword"
          placeholder="Re-enter your password"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
        {errors.confirmPassword ? (
          <small className="field-error">{errors.confirmPassword}</small>
        ) : null}
      </label>

      {status.message ? (
        <p className={`form-status ${status.type}`}>{status.message}</p>
      ) : null}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  )
}

export default RegisterForm
