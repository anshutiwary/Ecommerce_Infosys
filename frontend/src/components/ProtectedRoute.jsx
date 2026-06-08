import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ currentUser, children }) {
  const location = useLocation()

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
