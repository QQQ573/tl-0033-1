import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function LoginModal() {
  const { showLoginModal, closeLogin, login } = useAuth()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!showLoginModal) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('请输入邮箱地址')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('请输入有效的邮箱地址')
      return
    }
    try {
      setLoading(true)
      await login(email.trim(), name.trim())
      setEmail('')
      setName('')
    } catch (e) {
      setError(e.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={closeLogin}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ color: '#2d6a4f', margin: 0 }}>登录</h3>
          <button className="modal-close" onClick={closeLogin}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>邮箱地址</label>
            <input
              type="email"
              className="form-input"
              placeholder="请输入您的邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>昵称（可选）</label>
            <input
              type="text"
              className="form-input"
              placeholder="请输入您的昵称"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button
            type="submit"
            className="btn btn-primary btn-large"
            style={{ width: '100%', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </button>
          <p style={{ fontSize: 12, color: '#999', marginTop: 12, textAlign: 'center' }}>
            登录后可查看您认养的金丝猴完整成长日记
          </p>
        </form>
      </div>
    </div>
  )
}
