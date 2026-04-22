import { useState } from 'react'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

function App() {
  const [authMode, setAuthMode] = useState('login')
  const [currentUser, setCurrentUser] = useState(null)

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData)
    setAuthMode('dashboard')
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setAuthMode('login')
  }

  if (authMode === 'dashboard') {
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
