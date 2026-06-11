import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user, loading, openLogin, logout } = useAuth()

  function maskEmail(email) {
    if (!email) return ''
    const [name, domain] = email.split('@')
    if (!name || !domain) return email
    const maskedName =
      name.length <= 2 ? name.charAt(0) + '*' : name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1)
    return maskedName + '@' + domain
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          🐒 认养一只川金丝猴
        </Link>
        <div className="navbar-links">
          <Link to="/">首页</Link>
          <Link to="/cart" className="cart-btn">
            🛒 认养篮
          </Link>
          {!loading &&
            (user ? (
              <div className="user-info">
                <span className="user-email">👤 {maskEmail(user.email)}</span>
                <button className="btn-text" onClick={logout}>
                  退出
                </button>
              </div>
            ) : (
              <button className="btn-text" onClick={openLogin}>
                登录
              </button>
            ))}
        </div>
      </div>
    </nav>
  )
}
