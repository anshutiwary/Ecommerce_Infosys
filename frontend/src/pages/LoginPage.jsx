import LoginForm from '../components/LoginForm'

function LoginPage({ onSwitchToRegister }) {
  return (
    <main className="register-page">
      <section className="register-card">
        <div className="register-copy">
          <h1>Welcome back</h1>
          <p className="register-subtitle">
            Sign in to access your dashboard and continue your work.
          </p>
        </div>
        <LoginForm onSwitchToRegister={onSwitchToRegister} />
      </section>
    </main>
  )
}

export default LoginPage
