import React from 'react'
import { CartProvider } from './context/CartContext.jsx'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import HomePage from './pages/HomePage.jsx'
import MonkeyDetailPage from './pages/MonkeyDetailPage.jsx'
import CartPage from './pages/CartPage.jsx'
import PaymentPage from './pages/PaymentPage.jsx'
import SuccessPage from './pages/SuccessPage.jsx'
import CertificatePage from './pages/CertificatePage.jsx'

export default function App() {
  return (
    <CartProvider>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <div className="container">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/monkey/:id" element={<MonkeyDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/payment/:orderNo" element={<PaymentPage />} />
              <Route path="/success/:orderNo" element={<SuccessPage />} />
              <Route path="/certificate/:certNo" element={<CertificatePage />} />
            </Routes>
          </div>
        </main>
        <footer className="footer">
          <div className="container">
            <p>© 2026 川金丝猴保护研究中心 · 认养一只川金丝猴公益项目</p>
            <p className="footer-sub">让我们一起守护这些金色的精灵</p>
          </div>
        </footer>
      </div>
    </CartProvider>
  )
}
