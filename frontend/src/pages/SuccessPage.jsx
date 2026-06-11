import React, { useState, useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { orderApi } from '../api/index.js'

export default function SuccessPage() {
  const { orderNo } = useParams()
  const [searchParams] = useSearchParams()
  const [orders, setOrders] = useState([])
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
      setOrders(results.filter(Boolean))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)
  const monkeyNames = orders.map((o) => o.monkeyName).filter(Boolean).join('、')

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h2 className="success-title">认养成功！</h2>
        <p className="success-desc">
          感谢您的爱心与支持！<br />
          您的善意将成为{monkeyNames}最温暖的守护。
        </p>

        {orders.length > 1 && (
          <div className="success-info" style={{ marginBottom: 12 }}>
            <div className="success-info-row">
              <span className="success-info-label">认养数量</span>
              <span className="success-info-value">{orders.length} 只</span>
            </div>
            <div className="success-info-row">
              <span className="success-info-label">支付总金额</span>
              <span className="success-info-value" style={{ color: '#e85d04' }}>
                ¥{totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {orders.map((o) => (
          <div
            key={o.orderNo}
            className="success-info"
            style={{ marginBottom: orders.length > 1 ? 12 : 0, borderTop: orders.length > 1 ? '1px dashed #eee' : 'none', paddingTop: orders.length > 1 ? 12 : 0 }}
          >
            <div className="success-info-row">
              <span className="success-info-label">订单号</span>
              <span className="success-info-value">{o.orderNo}</span>
            </div>
            <div className="success-info-row">
              <span className="success-info-label">认养对象</span>
              <span className="success-info-value">{o.monkeyName}</span>
            </div>
            <div className="success-info-row">
              <span className="success-info-label">认养档位</span>
              <span className="success-info-value">{o.tierName}</span>
            </div>
            <div className="success-info-row">
              <span className="success-info-label">支付金额</span>
              <span className="success-info-value" style={{ color: '#e85d04' }}>
                ¥{Number(o.totalAmount).toFixed(2)}
              </span>
            </div>
            {o.certificateNo && (
              <div className="success-info-row">
                <span className="success-info-label">证书编号</span>
                <span className="success-info-value">{o.certificateNo}</span>
              </div>
            )}
          </div>
        ))}

        <div className="success-actions">
          <Link to="/" className="btn btn-outline btn-large">
            返回首页
          </Link>
          {orders.filter((o) => o.certificateNo).length === 1 && (
            <Link
              to={`/certificate/${orders.find((o) => o.certificateNo).certificateNo}`}
              className="btn btn-primary btn-large"
            >
              📄 查看认养证书
            </Link>
          )}
          {orders.filter((o) => o.certificateNo).length > 1 && (
            <Link
              to={`/certificate/${orders.find((o) => o.certificateNo).certificateNo}`}
              className="btn btn-primary btn-large"
            >
              📄 查看第 1 份证书（其余证书可在个人中心查看）
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
