import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Package } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const ExpiryManagement = () => {
  const [data, setData]     = useState({ expired:[], near_30:[], near_60:[], near_90:[] })
  const [loading, setLoading] = useState(true)
  const [tab, setTab]       = useState('expired')

  const load = async () => {
    setLoading(true)
    try {
      const [e, n30, n60, n90] = await Promise.all([
        api.get('/reports/expiry', { params: { days: 0 } }),
        api.get('/reports/expiry', { params: { days: 30 } }),
        api.get('/reports/expiry', { params: { days: 60 } }),
        api.get('/reports/expiry', { params: { days: 90 } }),
      ])
      setData({
        expired:  e.data.data.filter(m => new Date(m.expiry_date) < new Date()),
        near_30:  n30.data.data.filter(m => new Date(m.expiry_date) >= new Date()),
        near_60:  n60.data.data.filter(m => new Date(m.expiry_date) >= new Date() && (m.days_left||0) > 30),
        near_90:  n90.data.data.filter(m => new Date(m.expiry_date) >= new Date() && (m.days_left||0) > 60),
      })
    } catch { toast.error('Failed to load expiry data') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const TABS = [
    { id:'expired', label:'Expired', color:'var(--color-danger)', count: data.expired.length },
    { id:'near_30', label:'< 30 Days', color:'var(--color-danger)', count: data.near_30.length },
    { id:'near_60', label:'< 60 Days', color:'var(--color-warning)', count: data.near_60.length },
    { id:'near_90', label:'< 90 Days', color:'var(--color-warning)', count: data.near_90.length },
  ]

  const current = data[tab] || []

  const getBadge = (m) => {
    if (new Date(m.expiry_date) < new Date()) return 'badge-danger'
    const d = m.days_left
    if (d <= 30) return 'badge-danger'
    if (d <= 60) return 'badge-warning'
    return 'badge-info'
  }

  return (
    <div>
      <div className="page-header">
        <div><h2 className="page-title">Expiry Management</h2><p className="page-subtitle">Monitor and manage expiring stock</p></div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm" onClick={load}><RefreshCw size={14}/> Refresh</button>
        </div>
      </div>

      {/* Summary KPI */}
      <div className="kpi-grid" style={{ marginBottom:24 }}>
        {TABS.map(t => (
          <div key={t.id} className={`kpi-card ${t.id === 'expired' ? 'danger' : t.id === 'near_30' ? 'warning' : 'accent'}`}
            style={{ cursor:'pointer', outline: tab===t.id ? `2px solid ${t.color}` : 'none' }}
            onClick={() => setTab(t.id)}>
            <div className={`kpi-icon ${t.id === 'expired' ? 'danger' : t.id === 'near_30' ? 'warning' : 'accent'}`}><AlertTriangle size={22}/></div>
            <div className="kpi-value" style={{ color: t.color }}>{loading ? '—' : t.count}</div>
            <div className="kpi-label">{t.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom:20 }}>
        {TABS.map(t => (
          <button key={t.id} className={`tab-btn ${tab===t.id?'active':''}`} onClick={()=>setTab(t.id)}>
            {t.label} {t.count > 0 && <span className="nav-badge" style={{ marginLeft:6, position:'static', background: tab===t.id ? t.color : 'var(--bg-elevated)', color: tab===t.id ? '#fff' : 'var(--text-muted)' }}>{t.count}</span>}
          </button>
        ))}
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr><th>Medicine</th><th>Batch</th><th>Category</th><th>Expiry Date</th><th>Days Left</th><th>Quantity</th><th>Value at Risk</th></tr>
          </thead>
          <tbody>
            {loading ? Array(5).fill(0).map((_,i)=><tr key={i}>{Array(7).fill(0).map((__,j)=><td key={j}><div className="skeleton" style={{height:16,borderRadius:4}}/></td>)}</tr>) :
             current.length===0 ? (
              <tr><td colSpan={7} style={{textAlign:'center',padding:48,color:'var(--text-muted)'}}>
                <Package size={40} style={{opacity:0.3,display:'block',margin:'0 auto 8px'}}/>
                No medicines in this category 🎉
              </td></tr>
            ) : current.map(m=>(
              <motion.tr key={m.id} initial={{opacity:0}} animate={{opacity:1}}>
                <td>
                  <div style={{fontWeight:600,fontSize:'0.875rem'}}>{m.name}</div>
                  <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{m.generic_name||'—'} • {m.medicine_id}</div>
                </td>
                <td style={{fontFamily:'var(--font-mono)',fontSize:'0.8rem',color:'var(--text-secondary)'}}>{m.batch_number||'—'}</td>
                <td style={{fontSize:'0.82rem',color:'var(--text-secondary)'}}>{m.category_name||'—'}</td>
                <td style={{fontWeight:600,color: new Date(m.expiry_date)<new Date()?'var(--color-danger)':'var(--text-primary)'}}>
                  {new Date(m.expiry_date).toLocaleDateString('en-IN')}
                </td>
                <td>
                  <span className={`badge ${getBadge(m)}`}>
                    {new Date(m.expiry_date) < new Date() ? 'EXPIRED' : `${m.days_left}d`}
                  </span>
                </td>
                <td style={{fontWeight:600}}>{m.quantity} <span style={{color:'var(--text-muted)',fontSize:'0.78rem'}}>{m.unit}</span></td>
                <td style={{fontWeight:700,color:'var(--color-danger)'}}>
                  ₹{(parseFloat(m.selling_price||0) * parseInt(m.quantity||0)).toLocaleString('en-IN')}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ExpiryManagement
