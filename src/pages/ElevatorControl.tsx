import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ElevatorControl.css'

interface Device {
  id: number
  name: string
  location: string
  mode: string
  status: 'connected' | 'disconnected'
}

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

const mockDevices: Device[] = [
  { id: 1, name: '科学城前门人员出', location: '科学城西南门', mode: '自动', status: 'connected' },
  { id: 2, name: '科学城前门人员进', location: '科学城西南门', mode: '自动', status: 'connected' },
  { id: 3, name: '科学城前门非机动车出', location: '科学城西南门', mode: '自动', status: 'connected' },
  { id: 4, name: '科学城前门非机动车进', location: '科学城西南门', mode: '自动', status: 'connected' },
]

const mockLocations: LocationItem[] = [
  { id: 1, name: '科学城西南门', icon: '📁' },
  {
    id: 2,
    name: '科学城综合楼',
    icon: '📁',
    children: [
      { id: 21, name: '1号电梯厅', icon: '📄' },
      { id: 22, name: '2号电梯厅', icon: '📄' },
    ],
  },
  {
    id: 3,
    name: '科学城检测楼',
    icon: '📁',
    children: [
      { id: 31, name: '1号电梯', icon: '📄' },
      { id: 32, name: '2号电梯', icon: '📄' },
    ],
  },
  { id: 4, name: '科学城北门', icon: '📁' },
]

function ElevatorControl() {
  const navigate = useNavigate()
  const [currentLocation, setCurrentLocation] = useState('科学城西南门')
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
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

  const handleBatchOpen = () => {
    alert(`已对 ${selectedDevices.length} 个设备执行批量打开操作`)
    setSelectedDevices([])
    setBatchMode(false)
  }

  const handleMoreAction = (action: string) => {
    alert(`已对 ${selectedDevices.length} 个设备执行${action}操作`)
    setShowMoreActions(false)
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
        {mockDevices.map(device => (
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
                  <span className={`device-status ${device.status}`}>
                    {device.status === 'connected' ? '连接' : '断开'}
                  </span>
                </div>
                <div className="device-info">
                  <div className="info-row">
                    <span className="info-icon">ⓘ</span>
                    <span className="info-text">{device.mode}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-icon">ⓞ</span>
                    <span className="info-text">{device.location}</span>
                  </div>
                </div>
                <div className="device-actions">
                  <button className={`action-btn mode-btn ${device.mode === '自动' ? 'active' : ''}`}>
                    自动
                  </button>
                  <button className={`action-btn mode-btn ${device.mode === '常关' ? 'active' : ''}`}>
                    常关
                  </button>
                  <button className={`action-btn mode-btn open-mode ${device.mode === '常开' ? 'active' : ''}`}>
                    常开
                  </button>
                  <button className="action-btn primary-btn">打开</button>
                </div>
              </>
            )}

            {batchMode && (
              <div className="device-batch-info">
                <div className="device-header">
                  <span className="device-name">{device.name}</span>
                  <span className={`device-status ${device.status}`}>
                    {device.status === 'connected' ? '连接' : '断开'}
                  </span>
                </div>
                <div className="device-info">
                  <div className="info-row">
                    <span className="info-icon">ⓘ</span>
                    <span className="info-text">{device.mode}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-icon">ⓞ</span>
                    <span className="info-text">{device.location}</span>
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
            <button className="batch-open-btn" onClick={handleBatchOpen}>
              批量打开
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
                    className={`filter-option ${tempFilter.connectionStatus === '连接' ? 'active' : ''}`}
                    onClick={() => setTempFilter(f => ({ ...f, connectionStatus: f.connectionStatus === '连接' ? '' : '连接' }))}
                  >
                    连接
                  </button>
                  <button
                    className={`filter-option ${tempFilter.connectionStatus === '断开' ? 'active' : ''}`}
                    onClick={() => setTempFilter(f => ({ ...f, connectionStatus: f.connectionStatus === '断开' ? '' : '断开' }))}
                  >
                    断开
                  </button>
                </div>
              </div>

              <div className="filter-group">
                <div className="filter-label">用途标记</div>
                <div className="filter-options">
                  <button
                    className={`filter-option ${tempFilter.usageTag === '考勤' ? 'active' : ''}`}
                    onClick={() => setTempFilter(f => ({ ...f, usageTag: f.usageTag === '考勤' ? '' : '考勤' }))}
                  >
                    考勤
                  </button>
                  <button
                    className={`filter-option ${tempFilter.usageTag === '签到' ? 'active' : ''}`}
                    onClick={() => setTempFilter(f => ({ ...f, usageTag: f.usageTag === '签到' ? '' : '签到' }))}
                  >
                    签到
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

      {showMoreActions && (
        <div className="modal-overlay" onClick={() => setShowMoreActions(false)}>
          <div className="more-actions-modal" onClick={e => e.stopPropagation()}>
            <div className="more-action-item" onClick={() => handleMoreAction('批量自动')}>
              批量自动
            </div>
            <div className="more-action-item" onClick={() => handleMoreAction('批量常开')}>
              批量常开
            </div>
            <div className="more-action-item" onClick={() => handleMoreAction('批量常关')}>
              批量常关
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
