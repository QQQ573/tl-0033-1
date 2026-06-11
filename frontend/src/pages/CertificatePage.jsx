import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { certificateApi } from '../api/index.js'

export default function CertificatePage() {
  const { certNo } = useParams()
  const [cert, setCert] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCert()
  }, [certNo])

  async function loadCert() {
    try {
      setLoading(true)
      const res = await certificateApi.getByNo(certNo)
      if (res.code === 200) {
        setCert(res.data)
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

  if (!cert) {
    return <div className="loading">证书不存在</div>
  }

  const pdfUrl = certificateApi.view(certNo)
  const downloadUrl = certificateApi.download(certNo)

  function formatDate(dateStr) {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('zh-CN')
  }

  return (
    <div className="certificate-page">
      <Link to="/" className="back-link">
        ← 返回首页
      </Link>

      <h2 className="section-title">📄 我的认养证书</h2>

      <div className="certificate-info">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>证书编号</div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{cert.certificateNo}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>认养人</div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{cert.adopterDisplayName}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>颁发日期</div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{formatDate(cert.issuedAt)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>认养金丝猴</div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{cert.monkeyName}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>认养档位</div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{cert.tierName}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>认养期限</div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>
              {formatDate(cert.startDate)} ~ {formatDate(cert.endDate)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <a
            href={downloadUrl}
            className="btn btn-primary btn-large"
            style={{ textDecoration: 'none' }}
            target="_blank"
          >
            ⬇ 下载 PDF 证书
          </a>
        </div>
      </div>

      <div className="certificate-viewer">
        <iframe
          src={pdfUrl}
          title="认养证书预览"
          className="certificate-iframe"
        />
      </div>
    </div>
  )
}
