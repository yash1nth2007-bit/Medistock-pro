import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Pill, Truck, Users, Stethoscope, TrendingUp, TrendingDown,
  AlertTriangle, ShoppingCart, Receipt, DollarSign, Package,
  Activity, RefreshCw
} from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler)

const CHART_COLORS = {
  primary:  'rgba(20,184,166,1)',
  primaryBg:'rgba(20,184,166,0.15)',
  accent:   'rgba(59,130,246,1)',
  accentBg: 'rgba(59,130,246,0.15)',
  success:  'rgba(34,197,94,1)',
  warning:  'rgba(245,158,11,1)',
  danger:   'rgba(239,68,68,1)',
  purple:   'rgba(139,92,246,1)',
}

const CHART_OPTIONS_BASE = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(15,23,42,0.95)',
      borderColor: 'rgba(255,255,255,0.08)',
      borderWidth: 1,
      titleColor: '#F8FAFC',
      bodyColor: '#94A3B8',
      padding: 12,
      cornerRadius: 10,
    }
  },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false }, ticks: { color: '#64748B', font: { size: 11 } } },
    y: { grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false }, ticks: { color: '#64748B', font: { size: 11 } } }
  }
}

const KPICard = ({ icon: Icon, label, value, color, trend, trendVal, onClick }) => (
  <motion.div
    className={`kpi-card ${color}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4 }}
    onClick={onClick}
    style={{ cursor: onClick ? 'pointer' : 'default' }}
  >
    <div className={`kpi-icon ${color}`}><Icon size={22} /></div>
    <div className="kpi-value">{value ?? '—'}</div>
    <div className="kpi-label">{label}</div>
    {trendVal !== undefined && (
      <div className={`kpi-trend ${trend}`}>
        {trend === 'up' ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
        {trendVal}
      </div>
    )}
  </motion.div>
)

const SkeletonKPI = () => (
  <div className="kpi-card">
    <div className="skeleton" style={{ width:48,height:48,borderRadius:12,marginBottom:16 }} />
    <div className="skeleton" style={{ width:'60%',height:32,marginBottom:8 }} />
    <div className="skeleton" style={{ width:'80%',height:14 }} />
  </div>
)

const Dashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = async () => {
    try {
      setLoading(true)
      const { data: res } = await api.get('/dashboard')
      setData(res.data)
    } catch {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Build chart data from API response
  const buildPurchasesChart = () => {
    const months = data?.charts?.monthly_purchases || []
    const labels = months.map(m => {
      const [y, mo] = m.month.split('-')
      return new Date(y, mo - 1).toLocaleString('default', { month: 'short' })
    })
    return {
      labels,
      datasets: [
        {
          label: 'Purchases',
          data: months.map(m => parseFloat(m.amount)),
          borderColor: CHART_COLORS.accent,
          backgroundColor: CHART_COLORS.accentBg,
          tension: 0.4, fill: true, pointRadius: 4,
          pointBackgroundColor: CHART_COLORS.accent,
        }
      ]
    }
  }

  const buildCategoryChart = () => {
    const cats = data?.charts?.category_breakdown || []
    return {
      labels: cats.map(c => c.name),
      datasets: [{
        data: cats.map(c => c.count),
        backgroundColor: [
          CHART_COLORS.primary, CHART_COLORS.accent, CHART_COLORS.success,
          CHART_COLORS.warning, CHART_COLORS.danger, CHART_COLORS.purple,
          'rgba(249,115,22,1)', 'rgba(236,72,153,1)'
        ],
        borderWidth: 0,
        hoverOffset: 8,
      }]
    }
  }

  const fmt = (n) => n !== undefined && n !== null
    ? typeof n === 'number' ? n.toLocaleString('en-IN')
    : parseFloat(n).toLocaleString('en-IN')
    : '0'

  const fmtCurrency = (n) => `₹${fmt(n)}`

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm" onClick={load} disabled={loading} id="dashboard-refresh-btn">
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {loading ? Array(5).fill(0).map((_, i) => <SkeletonKPI key={i} />) : (
          <>
            <KPICard icon={Pill}        label="Total Medicines"  value={fmt(data?.medicines?.total)}      color="primary"  onClick={() => navigate('/medicines')} />
            <KPICard icon={AlertTriangle} label="Low Stock"      value={fmt(data?.medicines?.low_stock)}  color="warning"  onClick={() => navigate('/medicines?low_stock=true')} />
            <KPICard icon={Package}     label="Out of Stock"     value={fmt(data?.medicines?.out_of_stock)} color="danger" onClick={() => navigate('/medicines?expiry_status=out')} />
            <KPICard icon={Activity}    label="Near Expiry (30d)"value={fmt(data?.medicines?.near_expiry)} color="orange" onClick={() => navigate('/expiry')} />
            <KPICard icon={ShoppingCart} label="Monthly Purchases" value={fmtCurrency(data?.purchases?.this_month)} color="accent" />
          </>
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Purchases Trend */}
        <div className="card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Purchases Trend</div>
              <div className="chart-subtitle">Last 12 months</div>
            </div>
            <div style={{ display:'flex', gap:16, alignItems:'center' }}>
              <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.75rem', color:'var(--text-muted)' }}>
                <span style={{ width:10,height:10,borderRadius:2,background:CHART_COLORS.accent,display:'inline-block' }} /> Purchases
              </span>
            </div>
          </div>
          <div className="chart-wrapper" style={{ height: 240 }}>
            {!loading && data && (
              <Line
                data={buildPurchasesChart()}
                options={{ ...CHART_OPTIONS_BASE, plugins: { ...CHART_OPTIONS_BASE.plugins, legend: { display: false } } }}
              />
            )}
            {loading && <div className="skeleton" style={{ height:'100%', borderRadius:'var(--radius-md)' }} />}
          </div>
        </div>

        {/* Category Doughnut */}
        <div className="card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Medicine Categories</div>
              <div className="chart-subtitle">Distribution by count</div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:20, height:240 }}>
            <div style={{ width:200, height:200, flexShrink:0 }}>
              {!loading && data && (
                <Doughnut
                  data={buildCategoryChart()}
                  options={{
                    responsive: true, maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: { legend: { display: false }, tooltip: CHART_OPTIONS_BASE.plugins.tooltip }
                  }}
                />
              )}
              {loading && <div className="skeleton" style={{ width:200,height:200,borderRadius:'50%' }} />}
            </div>
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8, overflow:'hidden' }}>
              {(data?.charts?.category_breakdown || []).slice(0,6).map((cat, i) => {
                const colors = [CHART_COLORS.primary, CHART_COLORS.accent, CHART_COLORS.success, CHART_COLORS.warning, CHART_COLORS.danger, CHART_COLORS.purple]
                return (
                  <div key={cat.name} style={{ display:'flex', alignItems:'center', gap:8, fontSize:'0.78rem' }}>
                    <span style={{ width:8,height:8,borderRadius:2,background:colors[i],flexShrink:0 }} />
                    <span style={{ flex:1, color:'var(--text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{cat.name}</span>
                    <span style={{ color:'var(--text-primary)', fontWeight:600 }}>{cat.count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: tables */}
      <div className="grid-2">
        {/* Low Stock Alert */}
        <div className="card" style={{ padding:0 }}>
          <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border-color)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div className="chart-title">⚠ Low Stock Alerts</div>
              <div className="chart-subtitle">Medicines below reorder level</div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/medicines?low_stock=true')}>View All</button>
          </div>
          {loading ? (
            <div style={{ padding:20, display:'flex', flexDirection:'column', gap:12 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:36, borderRadius:8 }} />)}
            </div>
          ) : (
            <div>
              {(data?.low_stock_medicines || []).length === 0 ? (
                <div style={{ padding:32, textAlign:'center', color:'var(--text-muted)' }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>✅</div>
                  All stocks are adequate
                </div>
              ) : (data?.low_stock_medicines || []).map(med => (
                <div key={med.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 24px', borderBottom:'1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:'0.85rem', color:'var(--text-primary)' }}>{med.name}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Reorder at: {med.reorder_level} {med.unit}</div>
                  </div>
                  <span className="badge badge-warning">{med.quantity} left</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Near Expiry */}
        <div className="card" style={{ padding:0 }}>
          <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border-color)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div className="chart-title">🕐 Near Expiry</div>
              <div className="chart-subtitle">Expiring within 30 days</div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/expiry')}>View All</button>
          </div>
          {loading ? (
            <div style={{ padding:20, display:'flex', flexDirection:'column', gap:12 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:36, borderRadius:8 }} />)}
            </div>
          ) : (
            <div>
              {(data?.near_expiry_medicines || []).length === 0 ? (
                <div style={{ padding:32, textAlign:'center', color:'var(--text-muted)' }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>✅</div>
                  No medicines expiring soon
                </div>
              ) : (data?.near_expiry_medicines || []).map(med => (
                <div key={med.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 24px', borderBottom:'1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:'0.85rem', color:'var(--text-primary)' }}>{med.name}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Exp: {new Date(med.expiry_date).toLocaleDateString('en-IN')}</div>
                  </div>
                  <span className={`badge ${med.days_left <= 7 ? 'badge-danger' : 'badge-warning'}`}>
                    {med.days_left}d left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
