import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import api from '../../services/api'

const Header = ({ collapsed, onToggleSidebar, onOpenMobile }) => {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('medistock_user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.split(' ')
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name[0].toUpperCase()
  }

  const initials = user ? getInitials(user.name) : 'U'

  const handleSignOut = () => {
    localStorage.removeItem('medistock_user')
    navigate('/', { replace: true })
  }

  return (
    <header className={`header ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Hamburger */}
      <button
        className="btn-icon btn-ghost"
        onClick={onToggleSidebar}
        style={{ display:'none' }}
        id="sidebar-toggle-desktop"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>
      <button
        className="btn-icon btn-ghost"
        onClick={onOpenMobile}
        aria-label="Open menu"
        style={{ display:'flex' }}
        id="sidebar-toggle-mobile"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="header-search">
        <span className="header-search-icon"><Search size={16} /></span>
        <input
          type="text"
          placeholder="Search medicines, patients, suppliers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && navigate(`/medicines?search=${search}`)}
          aria-label="Global search"
        />
      </div>

      {/* Actions */}
      <div className="header-actions">
        {/* Theme toggle */}
        <button
          className="header-icon-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          data-tooltip={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Profile Dropdown */}
        <div className="dropdown" style={{ marginLeft: 8 }}>
          <button
            className="header-avatar"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="User menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-secondary), var(--color-accent))',
              color: '#fff',
              fontWeight: 700,
              border: '2px solid var(--border-color)',
              cursor: 'pointer'
            }}
          >
            {initials}
          </button>
          
          {menuOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 199 }}
                onClick={() => setMenuOpen(false)}
              />
              <div className="dropdown-menu" style={{ width: 220, zIndex: 200 }}>
                <div style={{ padding: '8px 12px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    {user?.name || 'User'}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 2 }}>
                    {user?.role || 'Staff'}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 1, textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {user?.email}
                  </div>
                </div>
                <div className="dropdown-divider" />
                <button
                  className="dropdown-item danger"
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
