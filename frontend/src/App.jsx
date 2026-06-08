import { useCallback, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProductDetailsPage from './pages/ProductDetailsPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderHistory from './pages/OrderHistory'
import ProfilePage from './pages/ProfilePage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './components/ProtectedRoute'
import Footer from './components/Footer'
import { getCart } from './services/cartService'
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

const resolvePostLoginPath = (user, requestedPath = '/') => {
  if (requestedPath && !['/', '/login', '/register'].includes(requestedPath)) {
    if (requestedPath === '/dashboard' && !isAdminUser(user)) {
      return '/'
    }

    return requestedPath
  }

  return isAdminUser(user) ? '/dashboard' : '/'
}

function AppRoutes() {
  const [currentUser, setCurrentUser] = useState(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [cartCount, setCartCount] = useState(0)
  const location = useLocation()
  const navigate = useNavigate()

  const loadCartCount = useCallback(async () => {
    try {
      const cartItems = await getCart()
      setCartCount(Array.isArray(cartItems) ? cartItems.length : 0)
    } catch {
      setCartCount(0)
    }
  }, [setCartCount])

  useEffect(() => {
    let isMounted = true

    const restoreSession = async () => {
      try {
        const sessionUser = await verifyStoredSession()

        if (!isMounted) {
          return
        }

        const restoredUser = getUserFromSession(sessionUser)
        if (!restoredUser) {
          setCurrentUser(null)
          setCartCount(0)
          return
        }

        setCurrentUser(restoredUser)
        await loadCartCount()
      } catch {
        if (!isMounted) {
          return
        }

        setCurrentUser(null)
        setCartCount(0)
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
  }, [loadCartCount])

  const handleLoginSuccess = async (userData, requestedPath = '/') => {
    const nextUser = getUserFromSession(userData)
    const nextPath = resolvePostLoginPath(nextUser, requestedPath)

    flushSync(() => {
      setCurrentUser(nextUser)
    })
    void loadCartCount()
    navigate(nextPath, { replace: true })
  }

  const handleLogout = useCallback(async () => {
    await logoutUser()
    setCurrentUser(null)
    setCartCount(0)
    navigate('/login', { replace: true })
  }, [navigate])

  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'light'
    }
    return window.localStorage.getItem('theme') || 'light'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const handleAuthLogout = () => {
      handleLogout()
    }

    window.addEventListener('authLogout', handleAuthLogout)

    return () => {
      window.removeEventListener('authLogout', handleAuthLogout)
    }
  }, [handleLogout])

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
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
    <>
      <Routes>
      <Route
        path="/"
        element={
          currentUser ? (
            <HomePage
              currentUser={currentUser}
              isAdmin={isAdminUser(currentUser)}
              cartCount={cartCount}
              refreshCartCount={loadCartCount}
              onLogout={handleLogout}
            />
          ) : (
            <Navigate to="/login" replace state={{ from: location }} />
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
            <Navigate to="/login" replace state={{ from: location }} />
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
              cartCount={cartCount}
              refreshCartCount={loadCartCount}
              onLogout={handleLogout}
            />
          ) : (
            <Navigate to="/login" replace state={{ from: location }} />
          )
        }
      />
      <Route
        path="/cart"
        element={
          currentUser ? (
            <CartPage
              currentUser={currentUser}
              isAdmin={isAdminUser(currentUser)}
              cartCount={cartCount}
              refreshCartCount={loadCartCount}
              onLogout={handleLogout}
            />
          ) : (
            <Navigate to="/login" replace state={{ from: location }} />
          )
        }
      />
      <Route
        path="/checkout"
        element={
          currentUser ? (
            <CheckoutPage
              currentUser={currentUser}
              isAdmin={isAdminUser(currentUser)}
              cartCount={cartCount}
              refreshCartCount={loadCartCount}
              onLogout={handleLogout}
            />
          ) : (
            <Navigate to="/login" replace state={{ from: location }} />
          )
        }
      />
      <Route
        path="/order-confirmation"
        element={
          currentUser ? (
            <OrderConfirmationPage
              currentUser={currentUser}
              isAdmin={isAdminUser(currentUser)}
              cartCount={cartCount}
              onLogout={handleLogout}
            />
          ) : (
            <Navigate to="/login" replace state={{ from: location }} />
          )
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute currentUser={currentUser}>
            <OrderHistory
              currentUser={currentUser}
              isAdmin={isAdminUser(currentUser)}
              cartCount={cartCount}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute currentUser={currentUser}>
            <ProfilePage
              currentUser={currentUser}
              isAdmin={isAdminUser(currentUser)}
              cartCount={cartCount}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/change-password"
        element={
          <ProtectedRoute currentUser={currentUser}>
            <ChangePasswordPage
              currentUser={currentUser}
              isAdmin={isAdminUser(currentUser)}
              cartCount={cartCount}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <Footer theme={theme} onToggleTheme={toggleTheme} />
  </>
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
