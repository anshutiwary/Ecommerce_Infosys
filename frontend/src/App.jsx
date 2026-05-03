import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProductDetailsPage from './pages/ProductDetailsPage'
import RegisterPage from './pages/RegisterPage'
import {
  logoutUser,
  verifyStoredSession,
} from './services/authService'
import './styles/register.css'

const getUserFromSession = (sessionData) =>
  sessionData?.user || sessionData?.data?.user || sessionData?.data || sessionData

const getUserRoles = (user) => {
  const roleValues = [
    user?.role,
    user?.userRole,
    user?.userType,
    user?.accountType,
    user?.data?.role,
    user?.user?.role,
  ]
  const arrayRoles = [
    ...(Array.isArray(user?.roles) ? user.roles : []),
    ...(Array.isArray(user?.authorities) ? user.authorities : []),
  ]

  return [...roleValues, ...arrayRoles]
    .map((role) => {
      if (typeof role === 'string') {
        return role
      }

      return role?.name || role?.role || role?.authority || ''
    })
    .filter(Boolean)
    .map((role) => role.toLowerCase())
}

const isAdminUser = (user) =>
  Boolean(user?.isAdmin || user?.admin || user?.data?.isAdmin || user?.user?.isAdmin) ||
  getUserRoles(user).some((role) => role === 'admin' || role === 'role_admin')

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

  const handleLoginSuccess = (userData, requestedPath = '/') => {
    const nextUser = getUserFromSession(userData)

    setCurrentUser(nextUser)
    navigate(
      requestedPath === '/dashboard' && isAdminUser(nextUser) ? '/dashboard' : '/',
      { replace: true },
    )
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
          currentUser ? (
            <HomePage
              currentUser={currentUser}
              isAdmin={isAdminUser(currentUser)}
              onLogout={handleLogout}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/login"
        element={
          currentUser ? (
            <Navigate to={isAdminUser(currentUser) ? '/dashboard' : '/'} replace />
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
            <Navigate to={isAdminUser(currentUser) ? '/dashboard' : '/'} replace />
          ) : (
            <RegisterPage onSwitchToLogin={() => navigate('/login')} />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          currentUser && isAdminUser(currentUser) ? (
            <DashboardPage user={currentUser} onLogout={handleLogout} />
          ) : currentUser ? (
            <Navigate to="/" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/product/:id"
        element={
          currentUser ? (
            <ProductDetailsPage
              currentUser={currentUser}
              isAdmin={isAdminUser(currentUser)}
              onLogout={handleLogout}
            />
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
