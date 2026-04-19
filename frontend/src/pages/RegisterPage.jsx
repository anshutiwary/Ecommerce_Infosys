import RegisterForm from '../components/RegisterForm'

function RegisterPage() {
  return (
    <main className="register-page">
      <section className="register-card">
        <div className="register-copy">
          <h1>Create your account</h1>
          <p className="register-subtitle">
            Register with your details to get started.
          </p>
        </div>
        <RegisterForm />
      </section>
    </main>
  )
}

export default RegisterPage
