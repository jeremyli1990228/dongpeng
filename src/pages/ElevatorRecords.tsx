import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { elevatorApi, type ElevatorRecord } from '../api/elevator'
import './ElevatorRecords.css'

function ElevatorRecords() {
  const navigate = useNavigate()
  const { elevatorId } = useParams<{ elevatorId: string }>()
  const [records, setRecords] = useState<ElevatorRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchName, setSearchName] = useState('')
  const [searchCard, setSearchCard] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  useEffect(() => {
    fetchRecords()
  }, [elevatorId])

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const data = await elevatorApi.getRecords(elevatorId ? parseInt(elevatorId) : undefined)
      setRecords(data)
    } catch (error) {
      console.error('Failed to fetch records:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchRecords()
  }

  const handleReset = () => {
    setSearchName('')
    setSearchCard('')
    setStartTime('')
    setEndTime('')
    fetchRecords()
  }

  const getAccessTypeLabel = (type: string) => {
    switch (type) {
      case 'card': return '刷卡'
      case 'remote': return '远程'
      case 'app': return 'APP'
      default: return type
    }
  }

  const getAccessTypeColor = (type: string) => {
    switch (type) {
      case 'card': return '#3b82f6'
      case 'remote': return '#10b981'
      case 'app': return '#f59e0b'
      default: return '#6b7280'
    }
  }

  const getResultLabel = (result: string) => {
    switch (result) {
      case 'success': return '成功'
      case 'denied': return '拒绝'
      default: return result
    }
  }

  const getResultColor = (result: string) => {
    switch (result) {
      case 'success': return '#10b981'
      case 'denied': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const filteredRecords = records.filter(record => {
    if (searchName && !record.personName.includes(searchName)) return false
    if (searchCard && !record.cardNumber.includes(searchCard)) return false
    return true
  })

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <span className="loading-text">加载中...</span>
      </div>
    )
  }

  return (
    <div className="records-container">
      <div className="records-header">
        <div className="header-left" onClick={() => navigate(-1)}>
          <span className="back-arrow">←</span>
          <span className="header-title">运行记录</span>
        </div>
        <div className="header-right">
          <span className="record-count">{filteredRecords.length}条记录</span>
        </div>
      </div>

      <div className="search-section">
        <div className="search-row">
          <div className="search-input-wrapper">
            <span className="search-icon">👤</span>
            <input
              type="text"
              placeholder="输入人员姓名"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="search-input-wrapper">
            <span className="search-icon">🆔</span>
            <input
              type="text"
              placeholder="输入卡号"
              value={searchCard}
              onChange={e => setSearchCard(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        <div className="search-row">
          <div className="search-input-wrapper">
            <span className="search-icon">📅</span>
            <input
              type="text"
              placeholder="开始时间"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="search-input-wrapper">
            <span className="search-icon">📅</span>
            <input
              type="text"
              placeholder="结束时间"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        <div className="search-buttons">
          <button className="search-btn" onClick={handleSearch}>查询</button>
          <button className="reset-btn" onClick={handleReset}>重置</button>
        </div>
      </div>

      <div className="records-content">
        {filteredRecords.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <span className="empty-text">暂无运行记录</span>
          </div>
        ) : (
          <div className="records-list">
            {filteredRecords.map(record => (
              <div className="record-card" key={record.id}>
                <div className="record-header">
                  <div className="record-elevator">{record.elevatorName}</div>
                  <div className="record-time">{record.accessTime}</div>
                </div>
                <div className="record-info">
                  <div className="info-item">
                    <span className="info-label">人员</span>
                    <span className="info-value">{record.personName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">卡号</span>
                    <span className="info-value">{record.cardNumber}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">楼层</span>
                    <span className="info-value">
                      {record.sourceFloor}F → {record.targetFloor}F
                    </span>
                  </div>
                </div>
                <div className="record-footer">
                  <span className="access-type" style={{ color: getAccessTypeColor(record.accessType) }}>
                    {getAccessTypeLabel(record.accessType)}
                  </span>
                  <span className="access-result" style={{ color: getResultColor(record.result) }}>
                    {getResultLabel(record.result)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ElevatorRecords
