import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { elevatorApi, type ElevatorDevice } from '../api/elevator'
import './ElevatorControl.css'

interface LocationItem {
  id: number
  name: string
  icon?: string
  children?: LocationItem[]
}

interface FilterState {
  areaType: string
  connectionStatus: string
  usageTag: string
  includeSubArea: string
}

const mockLocations: LocationItem[] = [
  { id: 1, name: '东鹏大厦1号正门', icon: '📁' },
  {
    id: 2,
    name: '东鹏大厦综合楼',
    icon: '📁',
    children: [
      { id: 21, name: '1号电梯厅', icon: '📄' },
      { id: 22, name: '2号电梯厅', icon: '📄' },
    ],
  },
  {
    id: 3,
    name: '东鹏大厦检测楼',
    icon: '📁',
    children: [
      { id: 31, name: '1号电梯', icon: '📄' },
      { id: 32, name: '2号电梯', icon: '📄' },
    ],
  },
  { id: 4, name: '东鹏大厦北门', icon: '📁' },
]

function ElevatorControl() {
  const navigate = useNavigate()
  const [devices, setDevices] = useState<ElevatorDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [currentLocation, setCurrentLocation] = useState('东鹏大厦1号正门')
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [showCallModal, setShowCallModal] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<ElevatorDevice | null>(null)
  const [callTargetFloor, setCallTargetFloor] = useState(1)
  const [callType, setCallType] = useState<'up' | 'down'>('up')
  const [batchMode, setBatchMode] = useState(false)
  const [showMoreActions, setShowMoreActions] = useState(false)
  const [selectedDevices, setSelectedDevices] = useState<number[]>([])
  const [expandedLocations, setExpandedLocations] = useState<number[]>([])
  const [selectedLocation, setSelectedLocation] = useState<number | null>(1)
  const [filter, setFilter] = useState<FilterState>({
    areaType: '',
    connectionStatus: '',
    usageTag: '',
    includeSubArea: '是',
  })
  const [tempFilter, setTempFilter] = useState<FilterState>({
    areaType: '',
    connectionStatus: '',
    usageTag: '',
    includeSubArea: '是',
  })

  useEffect(() => {
    fetchDevices()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchRealtimeStatus()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const fetchDevices = async () => {
    setLoading(true)
    try {
      const data = await elevatorApi.getDevices()
      setDevices(data)
    } catch (error) {
      console.error('Failed to fetch devices:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRealtimeStatus = async () => {
    try {
      const updatedDevices = await Promise.all(
        devices.map(async device => {
          const status = await elevatorApi.getRealtimeStatus(device.id)
          return { ...device, ...status }
        })
      )
      setDevices(updatedDevices)
    } catch (error) {
      console.error('Failed to fetch realtime status:', error)
    }
  }

  const toggleLocationExpand = (id: number) => {
    setExpandedLocations(prev =>
      prev.includes(id) ? prev.filter(lid => lid !== id) : [...prev, id]
    )
  }

  const handleSelectLocation = (id: number, name: string) => {
    setSelectedLocation(id)
  }

  const confirmLocation = () => {
    if (selectedLocation !== null) {
      const findLocation = (items: LocationItem[]): LocationItem | undefined => {
        for (const item of items) {
          if (item.id === selectedLocation) return item
          if (item.children) {
            const found = findLocation(item.children)
            if (found) return found
          }
        }
        return undefined
      }
      const loc = findLocation(mockLocations)
      if (loc) {
        setCurrentLocation(loc.name)
      }
    }
    setShowLocationPicker(false)
  }

  const toggleDeviceSelect = (id: number) => {
    setSelectedDevices(prev =>
      prev.includes(id) ? prev.filter(did => did !== id) : [...prev, id]
    )
  }

  const handleSetMode = async (deviceId: number, mode: 'auto' | 'controlled') => {
    try {
      const result = await elevatorApi.setMode(deviceId, mode)
      alert(result.message)
      await fetchDevices()
    } catch (error) {
      alert('设置模式失败')
    }
  }

  const handleCallElevator = (device: ElevatorDevice) => {
    setSelectedDevice(device)
    setCallTargetFloor(device.currentFloor || 1)
    setShowCallModal(true)
  }

  const confirmCallElevator = async () => {
    if (!selectedDevice) return
    try {
      const result = await elevatorApi.callElevator({
        elevatorId: selectedDevice.id,
        targetFloor: callTargetFloor,
        callType: callType,
      })
      alert(result.message)
      setShowCallModal(false)
    } catch (error) {
      alert('呼叫电梯失败')
    }
  }

  const handleBatchSetMode = async (mode: 'auto' | 'controlled') => {
    try {
      await Promise.all(selectedDevices.map(id => elevatorApi.setMode(id, mode)))
      alert(`已对 ${selectedDevices.length} 个电梯执行批量${mode === 'auto' ? '自动' : '受控'}模式设置`)
      setSelectedDevices([])
      setBatchMode(false)
      await fetchDevices()
    } catch (error) {
      alert('批量操作失败')
    }
  }

  const handleBatchCall = () => {
    alert(`已对 ${selectedDevices.length} 个电梯执行批量呼梯操作`)
    setSelectedDevices([])
    setBatchMode(false)
  }

  const resetFilter = () => {
    setTempFilter({
      areaType: '',
      connectionStatus: '',
      usageTag: '',
      includeSubArea: '是',
    })
  }

  const confirmFilter = () => {
    setFilter(tempFilter)
    setShowFilter(false)
  }

  const renderLocationTree = (items: LocationItem[], level = 0) => {
    return items.map(item => (
      <div key={item.id}>
        <div
          className="location-item"
          style={{ paddingLeft: `${16 + level * 20}px` }}
        >
          <input
            type="checkbox"
            checked={selectedLocation === item.id}
            onChange={() => handleSelectLocation(item.id, item.name)}
            className="location-checkbox"
          />
          {item.children && item.children.length > 0 && (
            <span
              className="location-expand"
              onClick={() => toggleLocationExpand(item.id)}
            >
              {expandedLocations.includes(item.id) ? '▾' : '▸'}
            </span>
          )}
          {!item.children && <span className="location-expand-placeholder"></span>}
          <span className="location-icon">{item.icon}</span>
          <span className="location-name">{item.name}</span>
        </div>
        {item.children && expandedLocations.includes(item.id) && (
          <div className="location-children">
            {renderLocationTree(item.children, level + 1)}
          </div>
        )}
      </div>
    ))
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online': return '在线'
      case 'offline': return '离线'
      case 'fault': return '故障'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#10b981'
      case 'offline': return '#6b7280'
      case 'fault': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'auto': return '自动'
      case 'controlled': return '受控'
      default: return mode
    }
  }

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'auto': return '#3b82f6'
      case 'controlled': return '#f59e0b'
      default: return '#6b7280'
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <span className="loading-text">加载中...</span>
      </div>
    )
  }

  return (
    <div className="elevator-control">
      <div className="ec-header">
        <div className="ec-header-left" onClick={() => setShowLocationPicker(true)}>
          <span className="ec-location">{currentLocation}</span>
          <span className="ec-dropdown-arrow">▾</span>
        </div>
        <div className="ec-header-right" onClick={() => setShowFilter(true)}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M6 12h12M10 18h4" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div className="ec-content">
        {devices.map(device => (
          <div
            className={`device-card ${batchMode ? 'batch-mode' : ''}`}
            key={device.id}
            onClick={() => batchMode && toggleDeviceSelect(device.id)}
          >
            {batchMode && (
              <div className="device-checkbox">
                <input
                  type="checkbox"
                  checked={selectedDevices.includes(device.id)}
                  onChange={() => toggleDeviceSelect(device.id)}
                  onClick={e => e.stopPropagation()}
                />
                <span className={`checkbox-label ${selectedDevices.includes(device.id) ? 'checked' : ''}`}>
                  {selectedDevices.includes(device.id) ? '已选中' : '未选'}
                </span>
              </div>
            )}

            {!batchMode && (
              <>
                <div className="device-header">
                  <span className="device-name">{device.name}</span>
                  <div className="device-status-bar">
                    <span className="status-badge" style={{ background: `${getStatusColor(device.status)}15`, color: getStatusColor(device.status) }}>
                      {getStatusLabel(device.status)}
                    </span>
                    {device.status === 'online' && (
                      <span className="floor-badge">
                        当前楼层: {device.currentFloor !== null ? `${device.currentFloor}F` : '--'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="device-info">
                  <div className="info-row">
                    <span className="info-icon">ⓘ</span>
                    <span className="info-text">运行模式: <span className="mode-value" style={{ color: getModeColor(device.mode) }}>{getModeLabel(device.mode)}</span></span>
                  </div>
                  <div className="info-row">
                    <span className="info-icon">ⓞ</span>
                    <span className="info-text">{device.location}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-icon">⏱</span>
                    <span className="info-text">更新时间: {new Date(device.lastUpdate).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="device-actions">
                  <button 
                    className={`action-btn mode-btn ${device.mode === 'auto' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSetMode(device.id, 'auto')
                    }}
                  >
                    自动
                  </button>
                  <button 
                    className={`action-btn mode-btn ${device.mode === 'controlled' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSetMode(device.id, 'controlled')
                    }}
                  >
                    受控
                  </button>
                  <button 
                    className="action-btn call-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCallElevator(device)
                    }}
                    disabled={device.status !== 'online'}
                  >
                    远程呼梯
                  </button>
                  <button 
                    className="action-btn record-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/elevator-records/${device.id}`)
                    }}
                  >
                    运行记录
                  </button>
                </div>
              </>
            )}

            {batchMode && (
              <div className="device-batch-info">
                <div className="device-header">
                  <span className="device-name">{device.name}</span>
                  <span className="status-badge" style={{ background: `${getStatusColor(device.status)}15`, color: getStatusColor(device.status) }}>
                    {getStatusLabel(device.status)}
                  </span>
                </div>
                <div className="device-info">
                  <div className="info-row">
                    <span className="info-icon">ⓘ</span>
                    <span className="info-text">{getModeLabel(device.mode)}模式</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="ec-bottom-bar">
        {!batchMode ? (
          <button className="batch-btn" onClick={() => setBatchMode(true)}>
            批量操作
          </button>
        ) : (
          <div className="batch-actions">
            <button className="cancel-btn" onClick={() => {
              setBatchMode(false)
              setSelectedDevices([])
            }}>
              取消操作
            </button>
            <button className="batch-open-btn" onClick={() => handleBatchCall()}>
              批量呼梯
            </button>
            <button className="more-actions-btn" onClick={() => setShowMoreActions(true)}>
              更多操作
            </button>
          </div>
        )}
      </div>

      {showLocationPicker && (
        <div className="modal-overlay" onClick={() => setShowLocationPicker(false)}>
          <div className="location-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-cancel" onClick={() => setShowLocationPicker(false)}>取消</span>
              <span className="modal-confirm" onClick={confirmLocation}>确定</span>
            </div>
            <div className="location-list">
              {renderLocationTree(mockLocations)}
            </div>
          </div>
        </div>
      )}

      {showFilter && (
        <div className="modal-overlay" onClick={() => setShowFilter(false)}>
          <div className="filter-modal" onClick={e => e.stopPropagation()}>
            <div className="filter-header">
              <span className="filter-reset" onClick={resetFilter}>重置</span>
              <span className="filter-more">更多筛选</span>
              <span className="filter-confirm" onClick={confirmFilter}>确认</span>
            </div>
            <div className="filter-content">
              <div className="filter-group">
                <div className="filter-label">区域类型</div>
                <div className="filter-options">
                  <button
                    className={`filter-option ${tempFilter.areaType === '普通' ? 'active' : ''}`}
                    onClick={() => setTempFilter(f => ({ ...f, areaType: f.areaType === '普通' ? '' : '普通' }))}
                  >
                    普通
                  </button>
                  <button
                    className={`filter-option ${tempFilter.areaType === '出入口' ? 'active' : ''}`}
                    onClick={() => setTempFilter(f => ({ ...f, areaType: f.areaType === '出入口' ? '' : '出入口' }))}
                  >
                    出入口
                  </button>
                </div>
              </div>

              <div className="filter-group">
                <div className="filter-label">连接状态</div>
                <div className="filter-options">
                  <button
                    className={`filter-option ${tempFilter.connectionStatus === '在线' ? 'active' : ''}`}
                    onClick={() => setTempFilter(f => ({ ...f, connectionStatus: f.connectionStatus === '在线' ? '' : '在线' }))}
                  >
                    在线
                  </button>
                  <button
                    className={`filter-option ${tempFilter.connectionStatus === '离线' ? 'active' : ''}`}
                    onClick={() => setTempFilter(f => ({ ...f, connectionStatus: f.connectionStatus === '离线' ? '' : '离线' }))}
                  >
                    离线
                  </button>
                </div>
              </div>

              <div className="filter-group">
                <div className="filter-label">运行模式</div>
                <div className="filter-options">
                  <button
                    className={`filter-option ${tempFilter.usageTag === '自动' ? 'active' : ''}`}
                    onClick={() => setTempFilter(f => ({ ...f, usageTag: f.usageTag === '自动' ? '' : '自动' }))}
                  >
                    自动
                  </button>
                  <button
                    className={`filter-option ${tempFilter.usageTag === '受控' ? 'active' : ''}`}
                    onClick={() => setTempFilter(f => ({ ...f, usageTag: f.usageTag === '受控' ? '' : '受控' }))}
                  >
                    受控
                  </button>
                </div>
              </div>

              <div className="filter-group">
                <div className="filter-label">包含下级区域设备</div>
                <div className="filter-options">
                  <button
                    className={`filter-option ${tempFilter.includeSubArea === '是' ? 'active highlight' : ''}`}
                    onClick={() => setTempFilter(f => ({ ...f, includeSubArea: '是' }))}
                  >
                    是
                  </button>
                  <button
                    className={`filter-option ${tempFilter.includeSubArea === '否' ? 'active' : ''}`}
                    onClick={() => setTempFilter(f => ({ ...f, includeSubArea: '否' }))}
                  >
                    否
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCallModal && selectedDevice && (
        <div className="modal-overlay" onClick={() => setShowCallModal(false)}>
          <div className="call-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">远程呼梯</span>
              <span className="modal-close" onClick={() => setShowCallModal(false)}>×</span>
            </div>
            <div className="call-content">
              <div className="call-info">
                <span className="call-device">{selectedDevice.name}</span>
                <span className="call-current-floor">当前楼层: {selectedDevice.currentFloor !== null ? `${selectedDevice.currentFloor}F` : '--'}</span>
              </div>

              <div className="floor-selector">
                <div className="floor-label">选择目标楼层</div>
                <div className="floor-grid">
                  {Array.from({ length: selectedDevice.totalFloors }, (_, i) => i + 1).map(floor => (
                    <button
                      key={floor}
                      className={`floor-btn ${callTargetFloor === floor ? 'active' : ''}`}
                      onClick={() => setCallTargetFloor(floor)}
                    >
                      {floor}F
                    </button>
                  ))}
                </div>
              </div>

              <div className="call-direction">
                <div className="direction-label">呼叫方向</div>
                <div className="direction-options">
                  <button
                    className={`direction-btn ${callType === 'up' ? 'active' : ''}`}
                    onClick={() => setCallType('up')}
                  >
                    ↑ 上行
                  </button>
                  <button
                    className={`direction-btn ${callType === 'down' ? 'active' : ''}`}
                    onClick={() => setCallType('down')}
                  >
                    ↓ 下行
                  </button>
                </div>
              </div>
            </div>
            <div className="call-footer">
              <button className="cancel-btn" onClick={() => setShowCallModal(false)}>取消</button>
              <button className="confirm-call-btn" onClick={confirmCallElevator}>确认呼叫</button>
            </div>
          </div>
        </div>
      )}

      {showMoreActions && (
        <div className="modal-overlay" onClick={() => setShowMoreActions(false)}>
          <div className="more-actions-modal" onClick={e => e.stopPropagation()}>
            <div className="more-action-item" onClick={() => handleBatchSetMode('auto')}>
              批量自动模式
            </div>
            <div className="more-action-item" onClick={() => handleBatchSetMode('controlled')}>
              批量受控模式
            </div>
            <div className="more-action-item" onClick={() => {
              alert(`已对 ${selectedDevices.length} 个电梯执行批量重启操作`)
              setShowMoreActions(false)
              setSelectedDevices([])
              setBatchMode(false)
            }}>
              批量重启
            </div>
            <div className="more-action-cancel" onClick={() => setShowMoreActions(false)}>
              取消操作
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ElevatorControl
