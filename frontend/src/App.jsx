import { useEffect, useState } from 'react'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import {
  logoutUser,
  verifyStoredSession,
} from './services/authService'

const getUserFromSession = (sessionData) =>
  sessionData?.user || sessionData?.data?.user || sessionData?.data || sessionData

function App() {
  const [authMode, setAuthMode] = useState('login')
  const [currentUser, setCurrentUser] = useState(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  useEffect(() => {
    let isMounted = true

    const restoreSession = async () => {
      try {
        const sessionUser = await verifyStoredSession()

        if (!isMounted) {
          return
        }

        setCurrentUser(getUserFromSession(sessionUser))
        setAuthMode('dashboard')
      } catch (error) {
        console.error(error)

        if (!isMounted) {
          return
        }

        setCurrentUser(null)
        setAuthMode('login')
      } finally {
        if (isMounted) {
          setIsCheckingSession(false)
        }
      }
    }

    restoreSession()

    return () => {
      isMounted = false
    }
  }, [])

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData)
    setAuthMode('dashboard')
  }

  const handleLogout = async () => {
    await logoutUser()
    setCurrentUser(null)
    setAuthMode('login')
  }

  if (isCheckingSession) {
    return (
      <main className="register-page">
        <section className="register-card">
          <div className="register-copy">
            <h1>Checking session</h1>
            <p className="register-subtitle">Verifying your authorization token.</p>
          </div>
        </section>
      </main>
    )
  }

  if (authMode === 'dashboard' && currentUser) {
    return <DashboardPage user={currentUser} onLogout={handleLogout} />
  }

  if (authMode === 'register') {
    return <RegisterPage onSwitchToLogin={() => setAuthMode('login')} />
  }

  return (
    <LoginPage
      onLoginSuccess={handleLoginSuccess}
      onSwitchToRegister={() => setAuthMode('register')}
    />
  )
}

export default App
