import { useNavigate } from 'react-router-dom'
import './Home.css'

interface MenuItem {
  icon: string
  label: string
  path?: string
  color: string
}

const menuItems: MenuItem[][] = [
  [
    { icon: '📝', label: '访客邀约', color: '#10b981' },
    { icon: '👤', label: '访客代约', color: '#f59e0b' },
  ],
  [
    { icon: '👥', label: '我的访客', color: '#10b981' },
    { icon: '📱', label: '自助采集', color: '#3b82f6' },
  ],
  [
    { icon: '📁', label: '放行申请', color: '#f59e0b' },
    { icon: '📋', label: '放行记录', color: '#3b82f6' },
  ],
  [
    { icon: '🔲', label: '扫码放行', color: '#3b82f6' },
    { icon: '📦', label: '放行待办', color: '#f59e0b' },
  ],
  [
    { icon: '🅿️', label: '车位申请', color: '#3b82f6' },
    { icon: '🅿️', label: '我的车位', color: '#3b82f6' },
  ],
  [
    { icon: '🚪', label: '出入口控制', color: '#3b82f6' },
    { icon: '📝', label: '通行记录', color: '#3b82f6' },
  ],
  [
    { icon: '🔑', label: '门禁设备', color: '#3b82f6' },
    { icon: '✋', label: '审批', color: '#f59e0b' },
  ],
  [
    { icon: '🛗', label: '梯控设备', color: '#f59e0b', path: '/elevator-control' },
  ],
]

function Home() {
  const navigate = useNavigate()

  const handleMenuClick = (item: MenuItem) => {
    if (item.path) {
      navigate(item.path)
    }
  }

  return (
    <div className="home-container">
      <div className="header-bg">
        <div className="logo-section">
          <div className="logo-icon">
            <span className="logo-shape">⟨⟩</span>
          </div>
          <span className="logo-text">智慧通行</span>
        </div>

        <div className="user-section">
          <div className="user-info">
            <h2 className="greeting">你好，魏国伟</h2>
            <p className="company">兴森科技-科学城</p>
            <div className="user-buttons">
              <button className="btn-personal">个人中心</button>
              <button className="btn-switch">切换角色</button>
            </div>
          </div>
          <div className="avatar-wrapper">
            <div className="avatar">
              <svg viewBox="0 0 100 120" className="avatar-svg">
                <ellipse cx="50" cy="105" rx="35" ry="15" fill="#9333ea" />
                <rect x="20" y="65" width="60" height="45" rx="8" fill="#a855f7" />
                <circle cx="50" cy="35" r="28" fill="#fcd34d" />
                <path d="M22 35 Q22 10 50 10 Q78 10 78 35 Q78 28 70 25 Q65 15 50 15 Q35 15 30 25 Q22 28 22 35" fill="#c05621" />
                <ellipse cx="38" cy="35" rx="4" ry="5" fill="#1f2937" />
                <ellipse cx="62" cy="35" rx="4" ry="5" fill="#1f2937" />
                <path d="M40 48 Q50 55 60 48" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
                <circle cx="30" cy="42" r="3" fill="#fca5a5" opacity="0.6" />
                <circle cx="70" cy="42" r="3" fill="#fca5a5" opacity="0.6" />
                <path d="M30 70 Q20 75 22 85" stroke="#fcd34d" strokeWidth="5" fill="none" strokeLinecap="round" />
                <path d="M70 70 Q80 75 78 85" stroke="#fcd34d" strokeWidth="5" fill="none" strokeLinecap="round" />
                <circle cx="22" cy="87" r="5" fill="#fcd34d" />
                <circle cx="78" cy="87" r="5" fill="#fcd34d" />
                <circle cx="50" cy="62" r="4" fill="#fde68a" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="menu-section">
        {menuItems.map((row, rowIndex) => (
          <div className="menu-row" key={rowIndex}>
            {row.map((item, itemIndex) => (
              <div
                className="menu-item"
                key={itemIndex}
                onClick={() => handleMenuClick(item)}
              >
                <div className="menu-icon-wrapper" style={{ background: `${item.color}15` }}>
                  <span className="menu-icon">{item.icon}</span>
                </div>
                <span className="menu-label">{item.label}</span>
                <span className="menu-arrow">›</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home
