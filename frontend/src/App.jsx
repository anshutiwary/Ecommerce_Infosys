import { useCallback, useEffect, useState } from 'react'
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
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import MyOrdersPage from './pages/MyOrdersPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import RegisterPage from './pages/RegisterPage'
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

function AppRoutes() {
  const [currentUser, setCurrentUser] = useState(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [cartCount, setCartCount] = useState(0)
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

        setCurrentUser(getUserFromSession(sessionUser))
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

    setCurrentUser(nextUser)
    await loadCartCount()
    navigate(
      requestedPath === '/dashboard' && isAdminUser(nextUser) ? '/dashboard' : '/',
      { replace: true },
    )
  }

  const handleLogout = async () => {
    await logoutUser()
    setCurrentUser(null)
    setCartCount(0)
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
              cartCount={cartCount}
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
              cartCount={cartCount}
              refreshCartCount={loadCartCount}
              onLogout={handleLogout}
            />
          ) : (
            <Navigate to="/login" replace />
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
            <Navigate to="/login" replace />
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
            <Navigate to="/login" replace />
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
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/orders"
        element={
          currentUser ? (
            <MyOrdersPage
              currentUser={currentUser}
              isAdmin={isAdminUser(currentUser)}
              cartCount={cartCount}
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
