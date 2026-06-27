import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Shield, Settings, FileText, TrendingUp, DollarSign, Package, BarChart3 } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const SuperAdmin = () => {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const ADMIN = import.meta.env.VITE_ADMIN_ROUTE || '/super-admin'

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data.data))
      .catch(() => toast.error('Failed to load admin stats'))
      .finally(() => setLoading(false))
  }, [])

  const KPI = ({ icon:Icon, label, value, color }) => (
    <div className={`kpi-card ${color}`}>
      <div className={`kpi-icon ${color}`}><Icon size={22}/></div>
      <div className="kpi-value">{loading ? '—' : value}</div>
      <div className="kpi-label">{label}</div>
    </div>
  )

  const NavCard = ({ to, icon, title, desc, color }) => (
    <Link to={to} style={{ textDecoration:'none' }}>
      <motion.div whileHover={{ y:-4 }} className="card" style={{ cursor:'pointer', borderTop:`3px solid var(--color-${color})` }}>
        <div style={{ width:44, height:44, borderRadius:'var(--radius-md)', background:`rgba(var(--rgb-${color}),0.1)`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12, fontSize:22 }}>{icon}</div>
        <h4 style={{ marginBottom:6 }}>{title}</h4>
        <p style={{ fontSize:'0.82rem' }}>{desc}</p>
      </motion.div>
    </Link>
  )

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)', padding:32 }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
            <div style={{ width:40, height:40, background:'linear-gradient(135deg,var(--color-secondary),var(--color-accent))', borderRadius:'var(--radius-md)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>💊</div>
            <div>
              <h2 style={{ fontSize:'1.25rem', fontWeight:800 }}>Super Admin Portal</h2>
              <p style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>MediStock Pro Enterprise AI</p>
            </div>
          </div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/dashboard')}>← Back to App</button>
      </div>

      {/* KPIs */}
      <div className="kpi-grid" style={{ marginBottom:28 }}>
        <KPI icon={Users}      label="Total Users"      value={stats?.total_users || 0}      color="primary" />
        <KPI icon={Package}    label="Medicines"        value={stats?.total_medicines || 0}   color="accent" />
        <KPI icon={DollarSign} label="Monthly Revenue"  value={`₹${(stats?.monthly_revenue||0).toLocaleString('en-IN')}`} color="success" />
        <KPI icon={TrendingUp} label="Monthly Sales"    value={stats?.monthly_sales || 0}     color="warning" />
        <KPI icon={Users}      label="Patients"         value={stats?.total_patients || 0}    color="purple" />
        <KPI icon={BarChart3}  label="Pending Alerts"   value={stats?.pending_notifications || 0} color="danger" />
      </div>

      {/* Quick Navigation */}
      <h3 style={{ marginBottom:16, color:'var(--text-muted)', fontSize:'0.8rem', textTransform:'uppercase', letterSpacing:'0.08em' }}>Administration</h3>
      <div className="grid-3" style={{ marginBottom:24 }}>
        <NavCard to={`${ADMIN}/users`}      icon="👥" title="User Management"  desc="Manage staff accounts, roles, and permissions" color="secondary" />
        <NavCard to={`${ADMIN}/settings`}   icon="⚙️" title="System Settings"  desc="Configure hospital name, currency, email, etc." color="accent" />
        <NavCard to={`${ADMIN}/audit-logs`} icon="📋" title="Audit Logs"       desc="Track all system changes and user activity"    color="warning" />
      </div>

      {/* Recent Users */}
      <div className="card" style={{ padding:0 }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border-color)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div className="chart-title">Recent Users</div>
          <Link to={`${ADMIN}/users`} className="btn btn-ghost btn-sm">Manage →</Link>
        </div>
        <div className="table-wrapper" style={{ border:'none', borderRadius:0 }}>
          <table className="data-table">
            <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Last Login</th></tr></thead>
            <tbody>
              {loading ? Array(4).fill(0).map((_,i) => (
                <tr key={i}>{[1,2,3,4].map(j => <td key={j}><div className="skeleton" style={{height:16,borderRadius:4}}/></td>)}</tr>
              )) : (stats?.recent_users || []).map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{fontWeight:600,fontSize:'0.875rem'}}>{u.full_name}</div>
                    <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{u.email}</div>
                  </td>
                  <td><span className="badge badge-primary" style={{fontSize:'0.65rem'}}>{u.role_display}</span></td>
                  <td><span className={`badge ${u.status==='active'?'badge-success':'badge-neutral'}`}>{u.status}</span></td>
                  <td style={{color:'var(--text-muted)',fontSize:'0.78rem'}}>{u.last_login ? new Date(u.last_login).toLocaleString('en-IN') : 'Never'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SuperAdmin
