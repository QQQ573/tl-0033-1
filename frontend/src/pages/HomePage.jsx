import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { monkeyApi } from '../api/index.js'
import LatestNews from '../components/LatestNews.jsx'

export default function HomePage() {
  const [monkeys, setMonkeys] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMonkeys()
  }, [])

  async function loadMonkeys() {
    try {
      setLoading(true)
      const res = await monkeyApi.list()
      if (res.code === 200) {
        setMonkeys(res.data || [])
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
    <div>
      <div className="hero">
        <h1>🐒 认养一只川金丝猴</h1>
        <p>
          川金丝猴是中国特有的珍稀濒危灵长类动物，仅栖息于四川、陕西、甘肃和湖北的高山密林中。
          每一份爱心，都能为它们的生存带来希望。
        </p>
      </div>

      <LatestNews />

      <h2 className="section-title">选择一只金丝猴</h2>

      <div className="monkey-grid">
        {monkeys.map((m) => (
          <Link
            key={m.id}
            to={`/monkey/${m.id}`}
            style={{ textDecoration: 'none' }}
          >
            <div className="monkey-card">
              <img
                src={m.imageUrl}
                alt={m.name}
                className="monkey-card-img"
                onError={(e) => {
                  e.target.src =
                    'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=600'
                }}
              />
              {m.isAdopted ? (
                <span className="adopted-badge">❤ 已认养</span>
              ) : (
                <span className="available-badge">✓ 可认养</span>
              )}
              <div className="monkey-card-body">
                <div className="monkey-card-name">
                  {m.name}
                  <span style={{ fontSize: 13, color: '#888', fontWeight: 'normal' }}>
                    {m.code}
                  </span>
                </div>
                <div className="monkey-card-meta">
                  {m.gender} · {m.age}岁 · {m.healthStatus}
                  <br />
                  栖息地：{m.habitat}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
