import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Pill, Truck, ShoppingCart, Receipt,
  Users, Stethoscope, FileText, AlertTriangle,
  BarChart3, Bell, Cpu, Settings, LogOut, ChevronRight, Package
} from 'lucide-react'

const NAV_ITEMS = [
  { section: 'Overview', items: [
    { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  ]},
  { section: 'Inventory', items: [
    { to: '/medicines',     icon: Pill,            label: 'Medicines' },
    { to: '/suppliers',     icon: Truck,           label: 'Suppliers' },
    { to: '/purchases',     icon: ShoppingCart,    label: 'Purchases' },
    { to: '/expiry',        icon: AlertTriangle,   label: 'Expiry Alerts', badgeKey: 'expiry' },
  ]},
]

const Sidebar = ({ collapsed, mobileOpen, onCloseMobile }) => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('medistock_user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem('medistock_user')
    navigate('/', { replace: true })
  }

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">💊</div>
        <div className="sidebar-logo-text">
          <div className="sidebar-logo-name">MediStock Pro</div>
          <div className="sidebar-logo-tagline">Enterprise AI</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ section, items }) => (
          <div key={section}>
            <div className="nav-section-title">{section}</div>
            {items.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
                title={collapsed ? label : undefined}
              >
                <span className="nav-icon"><Icon size={18} /></span>
                <span className="nav-label">{label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer — User profile & Logout */}
      <div className="sidebar-footer" style={{ padding: '16px 12px', borderTop: '1px solid var(--border-color)' }}>
        {user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!collapsed && (
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{user.role}</div>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="nav-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-danger)',
                cursor: 'pointer',
                border: 'none',
                background: 'rgba(239, 68, 68, 0.06)',
                width: '100%',
                fontWeight: 600,
                transition: 'var(--transition)'
              }}
              title={collapsed ? "Sign Out" : undefined}
            >
              <span className="nav-icon"><LogOut size={16} /></span>
              {!collapsed && <span className="nav-label">Sign Out</span>}
            </button>
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            {!collapsed && 'Guest Mode'}
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
