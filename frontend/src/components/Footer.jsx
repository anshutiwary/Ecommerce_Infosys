import { Link } from 'react-router-dom'

export default function Footer({ theme, onToggleTheme }) {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <div>
          <span className="store-brand">ProductHub</span>
          <p>Premium shopping, polished checkout, and modern commerce for every buyer.</p>
        </div>
        <button type="button" className="theme-toggle" onClick={onToggleTheme}>
          {theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
        </button>
      </div>

      <div className="footer-links">
        <Link to="/">Home</Link>
        <Link to="/orders">Order History</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/cart">Cart</Link>
      </div>

      <p className="footer-copy">© {new Date().getFullYear()} ProductHub. Built for fast, secure, and delightful shopping.</p>
    </footer>
  )
}
