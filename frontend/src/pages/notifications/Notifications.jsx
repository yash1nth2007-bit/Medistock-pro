import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, CheckCheck, RefreshCw, AlertTriangle, Info, Package, ShoppingCart } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const TYPE_CONFIG = {
  low_stock:  { icon: Package,       color: 'var(--color-warning)', bg: 'rgba(245,158,11,0.1)',  label: 'Low Stock' },
  near_expiry:{ icon: AlertTriangle, color: 'var(--color-danger)',  bg: 'rgba(239,68,68,0.1)',   label: 'Near Expiry' },
  expired:    { icon: AlertTriangle, color: 'var(--color-danger)',  bg: 'rgba(239,68,68,0.1)',   label: 'Expired' },
  purchase:   { icon: ShoppingCart,  color: 'var(--color-accent)',  bg: 'rgba(59,130,246,0.1)',  label: 'Purchase' },
  system:     { icon: Info,          color: 'var(--color-secondary)',bg: 'rgba(20,184,166,0.1)', label: 'System' },
}

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]   = useState(true)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [pagination, setPagination] = useState({ page:1,limit:20,total:0,pages:1 })

  const load = useCallback(async (page=1) => {
    setLoading(true)
    try {
      const { data } = await api.get('/notifications', { params: { page, limit:20, unread_only: unreadOnly } })
      setNotifications(data.data); setPagination(data.pagination)
    } catch { toast.error('Failed to load notifications') }
    finally { setLoading(false) }
  }, [unreadOnly])

  useEffect(() => { load(1) }, [unreadOnly])

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(ns => ns.map(n => n.id===id ? {...n,is_read:true} : n))
    } catch {}
  }

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(ns => ns.map(n => ({...n,is_read:true})))
      toast.success('All marked as read')
    } catch { toast.error('Failed') }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Notifications</h2>
          <p className="page-subtitle">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'} — {pagination.total} total</p>
        </div>
        <div className="page-actions">
          <label style={{ display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:'0.85rem',color:'var(--text-secondary)' }}>
            <input type="checkbox" checked={unreadOnly} onChange={e=>setUnreadOnly(e.target.checked)} style={{width:16,height:16,accentColor:'var(--color-secondary)',cursor:'pointer'}}/>
            Unread only
          </label>
          {unreadCount > 0 && (
            <button className="btn btn-outline btn-sm" onClick={markAllRead} id="mark-all-read-btn"><CheckCheck size={14}/> Mark All Read</button>
          )}
          <button className="btn btn-ghost btn-icon" onClick={()=>load(1)} id="refresh-notif-btn"><RefreshCw size={16}/></button>
        </div>
      </div>

      <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
        <AnimatePresence>
          {loading ? Array(6).fill(0).map((_,i) => (
            <div key={i} className="card" style={{padding:'16px 20px'}}>
              <div style={{display:'flex',gap:12,alignItems:'center'}}>
                <div className="skeleton" style={{width:40,height:40,borderRadius:10,flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div className="skeleton" style={{height:16,width:'60%',marginBottom:8}}/>
                  <div className="skeleton" style={{height:12,width:'40%'}}/>
                </div>
              </div>
            </div>
          )) : notifications.length === 0 ? (
            <div style={{textAlign:'center',padding:80,color:'var(--text-muted)'}}>
              <Bell size={48} style={{opacity:0.2,display:'block',margin:'0 auto 16px'}}/>
              <h4 style={{color:'var(--text-muted)',marginBottom:8}}>No notifications</h4>
              <p>You're all caught up!</p>
            </div>
          ) : notifications.map(n => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.system
            const Icon = cfg.icon
            return (
              <motion.div
                key={n.id}
                initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}}
                style={{
                  background: n.is_read ? 'var(--bg-surface)' : 'var(--bg-surface-2)',
                  border: `1px solid ${n.is_read ? 'var(--border-color)' : 'rgba(20,184,166,0.2)'}`,
                  borderRadius:'var(--radius-lg)', padding:'16px 20px',
                  display:'flex',alignItems:'flex-start',gap:14,
                  transition:'all 0.2s',
                  borderLeft: !n.is_read ? `3px solid var(--color-secondary)` : '1px solid var(--border-color)',
                }}
              >
                <div style={{width:40,height:40,borderRadius:10,background:cfg.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Icon size={18} style={{color:cfg.color}}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
                    <div>
                      <div style={{fontWeight:n.is_read?500:700,fontSize:'0.875rem',color:'var(--text-primary)',marginBottom:4}}>{n.title}</div>
                      <p style={{fontSize:'0.82rem',color:'var(--text-secondary)',margin:0,lineHeight:1.5}}>{n.message}</p>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                      <span className={`badge ${cfg.label==='Low Stock'?'badge-warning':cfg.label==='Near Expiry'||cfg.label==='Expired'?'badge-danger':'badge-info'}`} style={{fontSize:'0.65rem'}}>{cfg.label}</span>
                      {!n.is_read && (
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={()=>markRead(n.id)} data-tooltip="Mark as read" id={`read-notif-${n.id}`}>
                          <Check size={14} style={{color:'var(--color-secondary)'}}/>
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{fontSize:'0.72rem',color:'var(--text-muted)',marginTop:8}}>
                    {new Date(n.created_at).toLocaleString('en-IN')}
                  </div>
                </div>
                {!n.is_read && <div style={{width:8,height:8,borderRadius:'50%',background:'var(--color-secondary)',flexShrink:0,marginTop:6,boxShadow:'0 0 6px rgba(20,184,166,0.5)'}}/>}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {!loading && pagination.total > pagination.limit && (
        <div style={{display:'flex',justifyContent:'center',marginTop:20,gap:8}}>
          <button className="btn btn-outline btn-sm" disabled={pagination.page<=1} onClick={()=>load(pagination.page-1)}>‹ Previous</button>
          <button className="btn btn-outline btn-sm" disabled={pagination.page>=pagination.pages} onClick={()=>load(pagination.page+1)}>Next ›</button>
        </div>
      )}
    </div>
  )
}

export default Notifications
