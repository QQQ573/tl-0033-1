import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { monkeyApi, tierApi, diaryApi } from '../api/index.js'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import GrowthTimeline from '../components/GrowthTimeline.jsx'

export default function MonkeyDetailPage() {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { openLogin } = useAuth()

  const [monkey, setMonkey] = useState(null)
  const [tiers, setTiers] = useState([])
  const [selectedTier, setSelectedTier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  const [activeTab, setActiveTab] = useState('story')
  const [diaryData, setDiaryData] = useState(null)
  const [diaryLoading, setDiaryLoading] = useState(false)

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab')
    if (tabFromUrl === 'diary') {
      setActiveTab('diary')
    } else {
      setActiveTab('story')
    }
  }, [searchParams.toString()])

  useEffect(() => {
    loadData()
  }, [id])

  useEffect(() => {
    if (activeTab === 'diary' && monkey) {
      loadDiaries()
    }
  }, [activeTab, monkey?.id])

  async function loadData() {
    try {
      setLoading(true)
      const [mRes, tRes] = await Promise.all([
        monkeyApi.getById(id),
        tierApi.list()
      ])
      if (mRes.code === 200) setMonkey(mRes.data)
      if (tRes.code === 200) {
        setTiers(tRes.data || [])
        if (tRes.data && tRes.data.length > 0) {
          setSelectedTier(tRes.data[0])
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function loadDiaries() {
    try {
      setDiaryLoading(true)
      const res = await diaryApi.getByMonkeyId(id)
      if (res.code === 200) {
        setDiaryData(res.data)
      }
    } catch (e) {
      console.error('Load diaries error:', e)
    } finally {
      setDiaryLoading(false)
    }
  }

  function switchTab(tab) {
    setActiveTab(tab)
    if (tab === 'diary') {
      searchParams.set('tab', 'diary')
    } else {
      searchParams.delete('tab')
    }
    setSearchParams(searchParams, { replace: true })
  }

  function handleAddToCart() {
    if (!selectedTier) return
    addToCart(monkey, selectedTier)
    setToast(`已将${monkey.name}加入认养篮`)
    setTimeout(() => setToast(''), 2000)
  }

  function handleBuyNow() {
    if (!selectedTier) return
    addToCart(monkey, selectedTier)
    navigate('/cart')
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>加载中...</p>
      </div>
    )
  }

  if (!monkey) {
    return <div className="loading">未找到该金丝猴信息</div>
  }

  return (
    <div className="detail-page">
      <Link to="/" className="back-link">← 返回列表</Link>

      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#2d6a4f',
            color: 'white',
            padding: '12px 24px',
            borderRadius: 8,
            zIndex: 1000,
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}
        >
          {toast}
        </div>
      )}

      <div className="detail-header">
        <div className="detail-hero">
          <img
            src={monkey.imageUrl}
            alt={monkey.name}
            className="detail-hero-img"
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=600'
            }}
          />
          <div className="detail-hero-info">
            {monkey.isAdopted && (
              <span
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #ff6b6b, #ee5a6f)',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 'bold',
                  marginBottom: 12
                }}
              >
                ❤ 已被爱心人士认养
              </span>
            )}
            <h1 className="detail-name">{monkey.name}</h1>
            <div className="detail-code">编号：{monkey.code}</div>
            <div className="detail-info-grid">
              <div className="detail-info-item">
                <div className="detail-info-label">性别</div>
                <div className="detail-info-value">{monkey.gender}</div>
              </div>
              <div className="detail-info-item">
                <div className="detail-info-label">年龄</div>
                <div className="detail-info-value">{monkey.age} 岁</div>
              </div>
              <div className="detail-info-item">
                <div className="detail-info-label">健康状况</div>
                <div className="detail-info-value">{monkey.healthStatus}</div>
              </div>
              <div className="detail-info-item">
                <div className="detail-info-label">栖息地</div>
                <div className="detail-info-value">{monkey.habitat}</div>
              </div>
            </div>
            <div className="detail-info-item">
              <div className="detail-info-label">性格特点</div>
              <div className="detail-info-value">{monkey.personality}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-tabs">
        <div
          className={`tab-item ${activeTab === 'story' ? 'active' : ''}`}
          onClick={() => switchTab('story')}
        >
          📖 我的故事
        </div>
        <div
          className={`tab-item ${activeTab === 'diary' ? 'active' : ''}`}
          onClick={() => switchTab('diary')}
        >
          📝 成长足迹
          {diaryData?.total > 0 && (
            <span className="tab-badge">{diaryData.total}</span>
          )}
        </div>
      </div>

      {activeTab === 'story' && (
        <>
          <div className="detail-section">
            <h3 className="detail-section-title">关于我</h3>
            <p className="detail-story">{monkey.story}</p>
          </div>

          <div className="detail-section">
            <h3 className="detail-section-title">💚 选择认养档位</h3>
            <div className="tier-grid">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`tier-card ${selectedTier?.id === tier.id ? 'selected' : ''}`}
                  onClick={() => !monkey.isAdopted && setSelectedTier(tier)}
                  style={{ opacity: monkey.isAdopted ? 0.5 : 1 }}
                >
                  <div className="tier-name">{tier.name}</div>
                  <div className="tier-price">
                    ¥{Number(tier.price).toFixed(0)}
                    <small> / {tier.durationMonths}个月</small>
                  </div>
                  <div className="tier-desc">{tier.description}</div>
                  <div className="tier-benefits">{tier.benefits}</div>
                </div>
              ))}
            </div>

            {!monkey.isAdopted && (
              <div
                style={{
                  marginTop: 24,
                  display: 'flex',
                  gap: 16,
                  justifyContent: 'center'
                }}
              >
                <button className="btn btn-outline btn-large" onClick={handleAddToCart}>
                  🛒 加入认养篮
                </button>
                <button className="btn btn-primary btn-large" onClick={handleBuyNow}>
                  ❤ 立即认养
                </button>
              </div>
            )}

            {monkey.isAdopted && (
              <div
                style={{
                  marginTop: 24,
                  textAlign: 'center',
                  padding: 24,
                  background: '#fff5f5',
                  borderRadius: 12,
                  color: '#ee5a6f'
                }}
              >
                这只金丝猴已经被认养了，请选择其他可爱的小伙伴吧～
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'diary' && (
        <div className="detail-section">
          <h3 className="detail-section-title">
            📝 {monkey.name}的成长足迹
          </h3>
          {diaryLoading ? (
            <div className="loading">
              <div className="spinner" style={{ width: 30, height: 30 }}></div>
              <p>加载中...</p>
            </div>
          ) : (
            <GrowthTimeline
              monkeyId={monkey.id}
              monkeyName={monkey.name}
              diaries={diaryData?.diaries || []}
              isFullAccess={diaryData?.isFullAccess || false}
              total={diaryData?.total || 0}
              onLogin={openLogin}
            />
          )}
        </div>
      )}
    </div>
  )
}
