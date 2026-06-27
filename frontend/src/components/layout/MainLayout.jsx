import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:99,backdropFilter:'blur(4px)' }}
        />
      )}
      <div className={`main-content ${collapsed ? 'collapsed' : ''}`}>
        <Header
          collapsed={collapsed}
          onToggleSidebar={() => setCollapsed(c => !c)}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="page-wrapper">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
