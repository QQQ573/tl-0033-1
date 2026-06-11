import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { diaryApi } from '../api/index.js'

export default function LatestNews() {
  const navigate = useNavigate()
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNews()
  }, [])

  async function loadNews() {
    try {
      const res = await diaryApi.getLatest(5)
      if (res.code === 200) {
        setNews(res.data || [])
      }
    } catch (e) {
      console.error('Load latest news error:', e)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const month = d.getMonth() + 1
    const day = d.getDate()
    return `${d.getFullYear()}.${month.toString().padStart(2, '0')}.${day.toString().padStart(2, '0')}`
  }

  function handleClick(item) {
    navigate(`/monkey/${item.monkeyId}?tab=diary`)
  }

  if (loading || news.length === 0) {
    return null
  }

  return (
    <div className="latest-news-section">
      <div className="section-header">
        <h2>📰 最新动态</h2>
        <p className="section-desc">来自保育员的前线日记</p>
      </div>
      <div className="news-scroll-container">
        <div className="news-scroll">
          {news.map((item) => (
            <div
              key={item.id}
              className="news-card"
              onClick={() => handleClick(item)}
            >
              <div className="news-image">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} />
                ) : (
                  <div className="news-image-placeholder">🐒</div>
                )}
                <div className="news-date-badge">{formatDate(item.recordDate)}</div>
              </div>
              <div className="news-content">
                <div className="news-monkey-tag">
                  <span className="monkey-name">{item.monkeyName || '金丝猴'}</span>
                </div>
                <h3 className="news-title">{item.title}</h3>
                {item.content && (
                  <p className="news-summary">
                    {item.content.length > 60
                      ? item.content.substring(0, 60) + '…'
                      : item.content}
                  </p>
                )}
                {item.keeperName && (
                  <div className="news-meta">
                    <span>👩‍🌾 {item.keeperName}</span>
                  </div>
                )}
              </div>
              <div className="news-arrow">→</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
