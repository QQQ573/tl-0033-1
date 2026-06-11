import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { orderApi, paymentApi } from '../api/index.js'

export default function PaymentPage() {
  const { orderNo } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [payMethod, setPayMethod] = useState('wechat')
  const [paying, setPaying] = useState(false)
  const [loading, setLoading] = useState(true)

  function parseOrderNos() {
    const raw = searchParams.get('orderNos')
    if (raw) {
      try {
        const decoded = decodeURIComponent(raw)
        const list = decoded.split(',').map((s) => s.trim()).filter(Boolean)
        if (list.length > 0) return list
      } catch (e) {
        console.warn('解析 orderNos 参数失败', e)
      }
    }
    return [orderNo]
  }

  useEffect(() => {
    loadOrders()
  }, [orderNo, searchParams.toString()])

  async function loadOrders() {
    try {
      setLoading(true)
      const nos = parseOrderNos()
      const results = await Promise.all(
        nos.map((no) =>
          orderApi.getByOrderNo(no).then((res) => (res.code === 200 ? res.data : null))
        )
      )
      const valid = results.filter(Boolean)
      setOrders(valid)

      if (valid.length > 0 && valid.every((o) => o.status === 'COMPLETED')) {
        const all = valid.map((o) => o.orderNo).join(',')
        navigate(`/success/${valid[0].orderNo}?orderNos=${encodeURIComponent(all)}`)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handlePay() {
    if (orders.length === 0) return
    try {
      setPaying(true)
      const succeed = []
      for (const o of orders) {
        if (o.status === 'COMPLETED') {
          succeed.push(o)
          continue
        }
        const res = await paymentApi.simulate(o.orderNo)
        if (res.code === 200) {
          succeed.push(o)
        } else {
          alert(`支付 [${o.monkeyName}] 失败：${res.message}`)
          break
        }
      }

      if (succeed.length === orders.length) {
        const all = succeed.map((o) => o.orderNo).join(',')
        navigate(`/success/${succeed[0].orderNo}?orderNos=${encodeURIComponent(all)}`)
      } else {
        loadOrders()
      }
    } catch (e) {
      alert('支付出错：' + (e.message || '请稍后重试'))
    } finally {
      setPaying(false)
    }
  }

  const totalAmount = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>加载中...</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return <div className="loading">订单不存在</div>
  }

  return (
    <div className="payment-page">
      <Link to={`/cart`} className="back-link">
        ← 返回认养篮
      </Link>

      <div className="payment-card">
        <h2 style={{ color: '#2d6a4f', marginBottom: 8 }}>确认支付</h2>
        <p style={{ color: '#888', fontSize: 14 }}>
          共 {orders.length} 个认养订单
          {orders.length === 1 && `：订单号 ${orders[0].orderNo}`}
        </p>

        <div className="payment-amount">¥{totalAmount.toFixed(2)}</div>

        {orders.map((o) => (
          <div key={o.orderNo} className="payment-info" style={{ marginBottom: 12 }}>
            <div className="payment-info-row">
              <span style={{ color: '#888' }}>认养项目</span>
              <span style={{ fontWeight: 500 }}>{o.monkeyName}</span>
            </div>
            <div className="payment-info-row">
              <span style={{ color: '#888' }}>认养档位</span>
              <span style={{ fontWeight: 500 }}>{o.tierName}</span>
            </div>
            <div className="payment-info-row">
              <span style={{ color: '#888' }}>金额</span>
              <span style={{ fontWeight: 500, color: '#e85d04' }}>
                ¥{Number(o.totalAmount).toFixed(2)}
              </span>
            </div>
          </div>
        ))}

        <h3
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: '#333',
            marginBottom: 16,
            marginTop: 8,
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
          {paying ? `支付中... (${orders.filter((o) => o.status === 'COMPLETED').length}/${orders.length})`
            : `确认支付 ¥${totalAmount.toFixed(2)}`}
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
