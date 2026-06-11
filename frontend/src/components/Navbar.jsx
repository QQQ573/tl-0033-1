import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
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
        </div>
      </div>
    </nav>
  )
}
