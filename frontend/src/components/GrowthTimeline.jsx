import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

function WeightChart({ diaries, selectedId }) {
  const weightData = diaries
    .filter((d) => d.weightKg)
    .sort((a, b) => new Date(a.recordDate) - new Date(b.recordDate))

  if (weightData.length < 2) {
    return (
      <div style={{ padding: '16px 0', color: '#999', fontSize: 13 }}>
        暂无足够的体重数据绘制图表
      </div>
    )
  }

  const width = 320
  const height = 120
  const padding = { top: 10, right: 10, bottom: 20, left: 32 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const weights = weightData.map((d) => parseFloat(d.weightKg))
  const minW = Math.min(...weights)
  const maxW = Math.max(...weights)
  const range = maxW - minW || 1
  const yMin = Math.floor(minW - range * 0.2)
  const yMax = Math.ceil(maxW + range * 0.2)
  const yRange = yMax - yMin

  function getX(index) {
    return padding.left + (index / (weightData.length - 1)) * chartW
  }

  function getY(weight) {
    const w = parseFloat(weight)
    return padding.top + chartH - ((w - yMin) / yRange) * chartH
  }

  const points = weightData.map((d, i) => `${getX(i)},${getY(d.weightKg)}`).join(' ')
  const selectedIdx = weightData.findIndex((d) => d.id === selectedId)

  const yTicks = []
  const step = yRange / 4
  for (let i = 0; i <= 4; i++) {
    yTicks.push(yMin + step * i)
  }

  return (
    <div className="weight-chart">
      <div className="chart-title">
        📈 体重变化趋势（共 {weightData.length} 条记录）
      </div>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={padding.top + chartH - ((t - yMin) / yRange) * chartH}
              x2={width - padding.right}
              y2={padding.top + chartH - ((t - yMin) / yRange) * chartH}
              stroke="#eee"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
            <text
              x={padding.left - 4}
              y={padding.top + chartH - ((t - yMin) / yRange) * chartH + 4}
              fontSize="10"
              fill="#999"
              textAnchor="end"
            >
              {t.toFixed(1)}
            </text>
          </g>
        ))}

        <polyline
          points={points}
          fill="none"
          stroke="#52b788"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {weightData.map((d, i) => {
          const isSelected = selectedIdx === i
          const isLatest = i === weightData.length - 1
          const cx = getX(i)
          const cy = getY(d.weightKg)
          return (
            <g key={d.id}>
              <circle
                cx={cx}
                cy={cy}
                r={isSelected ? 6 : isLatest ? 5 : 3.5}
                fill={isSelected ? '#e85d04' : isLatest ? '#2d6a4f' : '#52b788'}
                stroke="#fff"
                strokeWidth="2"
              />
              <text
                x={cx}
                y={cy + (i % 2 === 0 ? -10 : 20)}
                fontSize="9"
                fill="#666"
                textAnchor="middle"
              >
                {parseFloat(d.weightKg).toFixed(1)}kg
              </text>
            </g>
          )
        })}

        <text y={height - 4} fontSize="9" fill="#ccc" textAnchor="middle" x={width / 2}>
          日期
        </text>
      </svg>
    </div>
  )
}

export default function GrowthTimeline({ monkeyId, monkeyName, diaries, isFullAccess, total, onLogin }) {
  const [expandedId, setExpandedId] = useState(null)
  const { user, loading } = useAuth()

  function toggleExpand(id) {
    if (!isFullAccess) {
      onLogin && onLogin()
      return
    }
    setExpandedId(expandedId === id ? null : id)
  }

  function formatDate(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const month = d.getMonth() + 1
    const day = d.getDate()
    return `${d.getFullYear()}年${month}月${day}日`
  }

  function formatShortDate(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  const moodEmoji = {
    '开心': '😊',
    '兴奋': '🤩',
    '平静': '😌',
    '温柔': '🥰',
    '满足': '😋',
    '好奇': '🤔',
    '活泼': '🏃',
    '威严': '👑',
    '沉稳': '🧘',
    '健康': '💪',
    '甜蜜': '🍬',
    '勇敢': '💪',
    '快乐': '😄',
    '安静': '😌',
    '平和': '🕊️'
  }

  if (!diaries || diaries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
        暂无成长日记
      </div>
    )
  }

  return (
    <div className="growth-timeline">
      {!isFullAccess && !loading && !user && (
        <div className="timeline-tip">
          <span>🔒 登录后可查看该金丝猴的全部 {total} 条成长日记</span>
          <button className="btn-text" onClick={onLogin} style={{ marginLeft: 12, color: '#52b788' }}>
            去登录
          </button>
        </div>
      )}

      {!isFullAccess && !loading && user && (
        <div className="timeline-tip">
          <span>🔒 认养 {monkeyName} 后可解锁全部 {total} 条成长日记</span>
        </div>
      )}

      <div className="timeline">
        {diaries.map((diary, index) => {
          const isExpanded = expandedId === diary.id
          const isFirst = index === 0
          const isLast = index === diaries.length - 1
          return (
            <div
              key={diary.id}
              className={`timeline-item ${isExpanded ? 'expanded' : ''} ${!isFullAccess ? 'locked' : ''}`}
            >
              <div className="timeline-line" />
              <div className="timeline-dot">
                {isFullAccess ? (diary.isSummary ? '📌' : '📝') : '🔒'}
              </div>
              <div className="timeline-content" onClick={() => toggleExpand(diary.id)}>
                <div className="timeline-header">
                  <span className="timeline-date">{formatDate(diary.recordDate)}</span>
                  {diary.moodTag && (
                    <span className="timeline-mood">
                      {moodEmoji[diary.moodTag] || '🐒'} {diary.moodTag}
                    </span>
                  )}
                </div>
                <div className="timeline-title">
                  {diary.title}
                  {!isFullAccess && <span className="summary-badge">摘要</span>}
                  <span className="timeline-expand-icon">{isExpanded ? '▲' : '▼'}</span>
                </div>

                {isExpanded && !diary.isSummary && (
                  <div className="timeline-body">
                    {diary.imageUrl && (
                      <div className="timeline-image">
                        <img src={diary.imageUrl} alt={diary.title} />
                      </div>
                    )}

                    {isFullAccess && <WeightChart diaries={diaries} selectedId={diary.id} />}

                    {diary.content && <p className="timeline-text">{diary.content}</p>}

                    {diary.weightKg && (
                      <div className="timeline-meta">
                        <span>⚖️ 体重：{parseFloat(diary.weightKg).toFixed(1)} kg</span>
                      </div>
                    )}

                    {diary.keeperName && (
                      <div className="timeline-meta">
                        <span>👩‍🌾 记录员：{diary.keeperName}</span>
                      </div>
                    )}
                  </div>
                )}

                {diary.isSummary && (
                  <div className="summary-hint">
                    {isFullAccess ? '' : '🔒 登录并认养后查看完整内容'}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
