import { useEffect } from 'react'

function ToastNotification({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (!message) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      onClose()
    }, 3500)

    return () => window.clearTimeout(timer)
  }, [message, onClose])

  if (!message) {
    return null
  }

  return (
    <div className={`toast-notification ${type}`} role="status" aria-live="polite">
      {message}
      <button type="button" className="toast-close" onClick={onClose} aria-label="Dismiss notification">
        ×
      </button>
    </div>
  )
}

export default ToastNotification
