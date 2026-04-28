import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import {
  logoutUser,
  verifyStoredSession,
} from './services/authService'
import './styles/register.css'

const getUserFromSession = (sessionData) =>
  sessionData?.user || sessionData?.data?.user || sessionData?.data || sessionData

function AppRoutes() {
  const [currentUser, setCurrentUser] = useState(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true

    const restoreSession = async () => {
      try {
        const sessionUser = await verifyStoredSession()

        if (!isMounted) {
          return
        }

        setCurrentUser(getUserFromSession(sessionUser))
      } catch {
        if (!isMounted) {
          return
        }

        setCurrentUser(null)
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
    navigate('/dashboard', { replace: true })
  }

  const handleLogout = async () => {
    await logoutUser()
    setCurrentUser(null)
    navigate('/login', { replace: true })
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

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate to={currentUser ? '/dashboard' : '/login'} replace />
        }
      />
      <Route
        path="/login"
        element={
          currentUser ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage
              onLoginSuccess={handleLoginSuccess}
              onSwitchToRegister={() => navigate('/register')}
            />
          )
        }
      />
      <Route
        path="/register"
        element={
          currentUser ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <RegisterPage onSwitchToLogin={() => navigate('/login')} />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          currentUser ? (
            <DashboardPage user={currentUser} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
