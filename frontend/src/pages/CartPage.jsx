import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { orderApi } from '../api/index.js'

export default function CartPage() {
  const { cartItems, removeFromCart, getTotal, adopterInfo, setAdopterInfo, clearCart } =
    useCart()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    const { name, value } = e.target
    setAdopterInfo((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function validate() {
    const newErrors = {}
    if (!adopterInfo.adopterName?.trim()) {
      newErrors.adopterName = '请填写您的姓名'
    }
    if (adopterInfo.adopterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adopterInfo.adopterEmail)) {
      newErrors.adopterEmail = '请填写有效的邮箱'
    }
    if (adopterInfo.adopterPhone && !/^1[3-9]\d{9}$/.test(adopterInfo.adopterPhone)) {
      newErrors.adopterPhone = '请填写有效的手机号'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit() {
    if (cartItems.length === 0) return
    if (!validate()) return

    try {
      setSubmitting(true)
      const orderResults = []

      for (const item of cartItems) {
        const res = await orderApi.create({
          monkeyId: item.monkey.id,
          tierId: item.tier.id,
          adopterName: adopterInfo.adopterName,
          adopterEmail: adopterInfo.adopterEmail || null,
          adopterPhone: adopterInfo.adopterPhone || null,
          message: adopterInfo.message || null,
          displayName: adopterInfo.displayName || null
        })
        if (res.code === 200) {
          orderResults.push(res.data)
        } else {
          alert(`认养 ${item.monkey.name} 失败：${res.message}`)
          return
        }
      }

      if (orderResults.length > 0) {
        const firstOrder = orderResults[0]
        const allOrderNos = orderResults.map((o) => o.orderNo).join(',')
        clearCart()
        navigate(`/payment/${firstOrder.orderNo}?orderNos=${encodeURIComponent(allOrderNos)}`)
      }
    } catch (e) {
      alert('提交失败：' + (e.message || '请稍后重试'))
    } finally {
      setSubmitting(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <Link to="/" className="back-link">
          ← 返回首页
        </Link>
        <div className="cart-empty">
          <div className="cart-empty-icon">🐒</div>
          <h3 style={{ marginBottom: 12 }}>认养篮还是空的</h3>
          <p style={{ marginBottom: 24 }}>快去挑选一只可爱的川金丝猴吧～</p>
          <Link to="/" className="btn btn-primary btn-large">
            去挑选金丝猴
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-container">
      <Link to="/" className="back-link">
        ← 继续挑选
      </Link>

      <h2 className="section-title">🛒 我的认养篮（{cartItems.length}）</h2>

      {cartItems.map((item) => (
        <div key={item.monkey.id} className="cart-item">
          <img
            src={item.monkey.imageUrl}
            alt={item.monkey.name}
            className="cart-item-img"
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=600'
            }}
          />
          <div className="cart-item-info">
            <div className="cart-item-name">{item.monkey.name}</div>
            <div className="cart-item-tier">
              {item.tier.name}（{item.tier.durationMonths}个月）
            </div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
              {item.tier.description}
            </div>
          </div>
          <div className="cart-item-price">¥{Number(item.tier.price).toFixed(2)}</div>
          <button
            className="btn btn-danger"
            onClick={() => removeFromCart(item.monkey.id)}
            style={{ padding: '8px 16px' }}
          >
            移除
          </button>
        </div>
      ))}

      <div className="detail-section" style={{ marginTop: 32 }}>
        <h3 className="detail-section-title">📝 认养人信息</h3>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
          您的隐私将被严格保护，公开页面仅显示脱敏后的姓名
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">
              姓名<span className="required">*</span>
            </label>
            <input
              className="form-input"
              name="adopterName"
              value={adopterInfo.adopterName || ''}
              onChange={handleChange}
              placeholder="请输入您的真实姓名"
            />
            {errors.adopterName && (
              <p style={{ color: '#ee5a6f', fontSize: 12, marginTop: 6 }}>
                {errors.adopterName}
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">手机号</label>
            <input
              className="form-input"
              name="adopterPhone"
              value={adopterInfo.adopterPhone || ''}
              onChange={handleChange}
              placeholder="用于接收认养通知（选填）"
            />
            {errors.adopterPhone && (
              <p style={{ color: '#ee5a6f', fontSize: 12, marginTop: 6 }}>
                {errors.adopterPhone}
              </p>
            )}
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">邮箱</label>
            <input
              className="form-input"
              name="adopterEmail"
              type="email"
              value={adopterInfo.adopterEmail || ''}
              onChange={handleChange}
              placeholder="用于接收电子证书（选填）"
            />
            {errors.adopterEmail && (
              <p style={{ color: '#ee5a6f', fontSize: 12, marginTop: 6 }}>
                {errors.adopterEmail}
              </p>
            )}
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">给金丝猴的寄语</label>
            <textarea
              className="form-textarea"
              name="message"
              value={adopterInfo.message || ''}
              onChange={handleChange}
              placeholder="写下您对这只小精灵的祝福吧～（选填，最多500字）"
              maxLength={500}
            />
          </div>
        </div>
      </div>

      <div className="cart-summary">
        <div className="cart-summary-row">
          <span>认养项目</span>
          <span>{cartItems.length} 只</span>
        </div>
        <div className="cart-summary-total">
          <span>合计金额</span>
          <span>¥{getTotal().toFixed(2)}</span>
        </div>
      </div>

      <div className="cart-actions">
        <button
          className="btn btn-outline btn-large"
          onClick={() => navigate('/')}
        >
          继续挑选
        </button>
        <button
          className="btn btn-primary btn-large"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? '提交中...' : '确认认养并支付'}
        </button>
      </div>
    </div>
  )
}
