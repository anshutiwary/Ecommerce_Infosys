import '../styles/register.css'

function DashboardPage({ user, onLogout }) {
  const displayName = user?.name ||  'User'

  return (
    <main className="dashboard-page">
      <section className="dashboard-shell">
        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
          </div>
          <button type="button" className="dashboard-logout" onClick={onLogout}>
            Logout
          </button>
        </header>

        <section className="dashboard-hero">
          <p>Welcome back,</p>
          <h2>{displayName}</h2>
          <span>You have successfully logged in.</span>
        </section>
      </section>
    </main>
  )
}

export default DashboardPage
