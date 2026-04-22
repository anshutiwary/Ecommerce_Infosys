import RegisterForm from '../components/RegisterForm'

function RegisterPage({ onSwitchToLogin }) {
  return (
    <main className="register-page">
      <section className="register-card">
        <div className="register-copy">
          <h1>Create your account</h1>
          <p className="register-subtitle">
            Register with your details to get started.
          </p>
        </div>
        <RegisterForm onSwitchToLogin={onSwitchToLogin} />
      </section>
    </main>
  )
}

export default RegisterPage
