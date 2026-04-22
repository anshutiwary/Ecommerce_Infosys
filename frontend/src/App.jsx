import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

function App() {
  const [authMode, setAuthMode] = useState('login')

  if (authMode === 'register') {
    return <RegisterPage onSwitchToLogin={() => setAuthMode('login')} />
  }

  return <LoginPage onSwitchToRegister={() => setAuthMode('register')} />
}

export default App
