import { useLocation } from 'react-router-dom'
import LoginForm from '../components/LoginForm'

function LoginPage({ onLoginSuccess, onSwitchToRegister }) {
  const location = useLocation()
  const requestedPath = location.state?.from?.pathname || '/'

  return (
    <main className="register-page">
      <section className="register-card">
        <div className="register-copy">
          <h1>Welcome back</h1>
          <p className="register-subtitle">
            Sign in to access your dashboard and continue your work.
          </p>
        </div>
        <LoginForm
          onLoginSuccess={onLoginSuccess}
          onSwitchToRegister={onSwitchToRegister}
          requestedPath={requestedPath}
        />
      </section>
    </main>
  )
}

export default LoginPage
