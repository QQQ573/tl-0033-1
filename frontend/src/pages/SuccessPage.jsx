import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { orderApi } from '../api/index.js'

export default function SuccessPage() {
  const { orderNo } = useParams()
  const [order, setOrder] = useState(null)
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
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
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

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h2 className="success-title">认养成功！</h2>
        <p className="success-desc">
          感谢您的爱心与支持！<br />
          您的善意将成为{order?.monkeyName}最温暖的守护。
        </p>

        <div className="success-info">
          <div className="success-info-row">
            <span className="success-info-label">订单号</span>
            <span className="success-info-value">{order?.orderNo}</span>
          </div>
          <div className="success-info-row">
            <span className="success-info-label">认养对象</span>
            <span className="success-info-value">{order?.monkeyName}</span>
          </div>
          <div className="success-info-row">
            <span className="success-info-label">认养档位</span>
            <span className="success-info-value">{order?.tierName}</span>
          </div>
          <div className="success-info-row">
            <span className="success-info-label">支付金额</span>
            <span className="success-info-value" style={{ color: '#e85d04' }}>
              ¥{order ? Number(order.totalAmount).toFixed(2) : '0.00'}
            </span>
          </div>
          {order?.certificateNo && (
            <div className="success-info-row">
              <span className="success-info-label">证书编号</span>
              <span className="success-info-value">{order.certificateNo}</span>
            </div>
          )}
        </div>

        <div className="success-actions">
          <Link to="/" className="btn btn-outline btn-large">
            返回首页
          </Link>
          {order?.certificateNo && (
            <Link
              to={`/certificate/${order.certificateNo}`}
              className="btn btn-primary btn-large"
            >
              📄 查看认养证书
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
