import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { orderApi, paymentApi } from '../api/index.js'

export default function PaymentPage() {
  const { orderNo } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [payMethod, setPayMethod] = useState('wechat')
  const [paying, setPaying] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrder()
  }, [orderNo])

  async function loadOrder() {
    try {
      setLoading(true)
      const res = await orderApi.getByOrderNo(orderNo)
      if (res.code === 200) {
        setOrder(res.data)
        if (res.data.status === 'COMPLETED') {
          navigate(`/success/${orderNo}`)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handlePay() {
    if (!order) return
    try {
      setPaying(true)
      const res = await paymentApi.simulate(orderNo)
      if (res.code === 200) {
        navigate(`/success/${orderNo}`)
      } else {
        alert('支付失败：' + res.message)
      }
    } catch (e) {
      alert('支付出错：' + (e.message || '请稍后重试'))
    } finally {
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>加载中...</p>
      </div>
    )
  }

  if (!order) {
    return <div className="loading">订单不存在</div>
  }

  return (
    <div className="payment-page">
      <Link to={`/cart`} className="back-link">
        ← 返回认养篮
      </Link>

      <div className="payment-card">
        <h2 style={{ color: '#2d6a4f', marginBottom: 8 }}>确认支付</h2>
        <p style={{ color: '#888', fontSize: 14 }}>订单号：{order.orderNo}</p>

        <div className="payment-amount">¥{Number(order.totalAmount).toFixed(2)}</div>

        <div className="payment-info">
          <div className="payment-info-row">
            <span style={{ color: '#888' }}>认养项目</span>
            <span style={{ fontWeight: 500 }}>{order.monkeyName}</span>
          </div>
          <div className="payment-info-row">
            <span style={{ color: '#888' }}>认养档位</span>
            <span style={{ fontWeight: 500 }}>{order.tierName}</span>
          </div>
          <div className="payment-info-row">
            <span style={{ color: '#888' }}>创建时间</span>
            <span style={{ color: '#666', fontSize: 13 }}>
              {new Date(order.createdAt).toLocaleString('zh-CN')}
            </span>
          </div>
        </div>

        <h3
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: '#333',
            marginBottom: 16,
            textAlign: 'left'
          }}
        >
          选择支付方式
        </h3>
        <div className="payment-methods">
          <div
            className={`payment-method ${payMethod === 'wechat' ? 'selected' : ''}`}
            onClick={() => setPayMethod('wechat')}
          >
            <div className="payment-method-icon">💚</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>微信支付</div>
          </div>
          <div
            className={`payment-method ${payMethod === 'alipay' ? 'selected' : ''}`}
            onClick={() => setPayMethod('alipay')}
          >
            <div className="payment-method-icon">💙</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>支付宝</div>
          </div>
        </div>

        <button
          className="btn btn-primary btn-large"
          style={{ width: '100%', marginTop: 16 }}
          onClick={handlePay}
          disabled={paying}
        >
          {paying ? '支付中...' : `确认支付 ¥${Number(order.totalAmount).toFixed(2)}`}
        </button>

        <p
          style={{
            fontSize: 12,
            color: '#aaa',
            marginTop: 16,
            textAlign: 'center'
          }}
        >
          🔒 本页面为公益项目模拟支付演示，不会产生真实扣款
        </p>
      </div>
    </div>
  )
}
