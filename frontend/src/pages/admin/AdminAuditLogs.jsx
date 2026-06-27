import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, RefreshCw } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const METHOD_BADGE = { GET:'badge-info', POST:'badge-success', PUT:'badge-warning', PATCH:'badge-warning', DELETE:'badge-danger' }

const AdminAuditLogs = () => {
  const navigate = useNavigate()
  const ADMIN = import.meta.env.VITE_ADMIN_ROUTE || '/super-admin'
  const [logs, setLogs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [pagination, setPagination] = useState({ page:1, limit:30, total:0, pages:1 })
  const [filters, setFilters]   = useState({ search:'', user_id:'', action:'', from_date:'', to_date:'' })

  const load = useCallback(async (page=1) => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/audit-logs', { params: { page, limit:30, ...filters } })
      setLogs(data.data); setPagination(data.pagination)
    } catch { toast.error('Failed to load audit logs') }
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { load(1) }, [filters])

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)', padding:32 }}>
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={()=>navigate(ADMIN)} style={{marginBottom:8}}><ArrowLeft size={16}/> Admin Home</button>
          <h2 className="page-title">Audit Logs</h2>
          <p className="page-subtitle">{pagination.total} log entries</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-icon" onClick={()=>load(pagination.page)} id="refresh-logs-btn"><RefreshCw size={16}/></button>
        </div>
      </div>

      <div className="filter-bar" style={{ marginBottom:20 }}>
        <div className="search-wrap">
          <Search size={16} className="search-icon"/>
          <input placeholder="Search entity, action…" value={filters.search} onChange={e=>setFilters(f=>({...f,search:e.target.value}))}/>
        </div>
        <select className="form-control" style={{width:'auto'}} value={filters.action} onChange={e=>setFilters(f=>({...f,action:e.target.value}))}>
          <option value="">All Methods</option>
          {['GET','POST','PUT','PATCH','DELETE'].map(m=><option key={m}>{m}</option>)}
        </select>
        <input type="date" className="form-control" style={{width:'auto'}} value={filters.from_date} onChange={e=>setFilters(f=>({...f,from_date:e.target.value}))}/>
        <input type="date" className="form-control" style={{width:'auto'}} value={filters.to_date}   onChange={e=>setFilters(f=>({...f,to_date:e.target.value}))}/>
        {Object.values(filters).some(v=>v) && <button className="btn btn-ghost btn-sm" onClick={()=>setFilters({search:'',user_id:'',action:'',from_date:'',to_date:''})}>Clear</button>}
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead><tr><th>User</th><th>Method</th><th>Endpoint</th><th>Entity</th><th>Status</th><th>IP</th><th>Time</th></tr></thead>
          <tbody>
            {loading ? Array(10).fill(0).map((_,i)=><tr key={i}>{Array(7).fill(0).map((__,j)=><td key={j}><div className="skeleton" style={{height:14,borderRadius:4}}/></td>)}</tr>) :
             logs.length === 0 ? (
              <tr><td colSpan={7} style={{textAlign:'center',padding:48,color:'var(--text-muted)'}}>No audit logs found</td></tr>
            ) : logs.map((log,i) => (
              <motion.tr key={log.id||i} initial={{opacity:0}} animate={{opacity:1}}>
                <td style={{fontSize:'0.8rem'}}>
                  <div style={{fontWeight:600}}>{log.user_name||'System'}</div>
                  <div style={{color:'var(--text-muted)',fontSize:'0.72rem'}}>{log.user_role}</div>
                </td>
                <td><span className={`badge ${METHOD_BADGE[log.method]||'badge-neutral'}`} style={{fontSize:'0.65rem'}}>{log.method}</span></td>
                <td style={{fontFamily:'var(--font-mono)',fontSize:'0.75rem',color:'var(--text-secondary)',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{log.endpoint}</td>
                <td style={{fontSize:'0.78rem',color:'var(--text-secondary)'}}>{log.entity_type}{log.entity_id ? ` #${log.entity_id}` : ''}</td>
                <td>
                  <span className={`badge ${log.status_code >= 200 && log.status_code < 300 ? 'badge-success' : log.status_code >= 400 ? 'badge-danger' : 'badge-neutral'}`} style={{fontSize:'0.65rem'}}>
                    {log.status_code}
                  </span>
                </td>
                <td style={{fontFamily:'var(--font-mono)',fontSize:'0.72rem',color:'var(--text-muted)'}}>{log.ip_address}</td>
                <td style={{fontSize:'0.72rem',color:'var(--text-muted)',whiteSpace:'nowrap'}}>{new Date(log.created_at).toLocaleString('en-IN')}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {!loading && pagination.total > pagination.limit && (
          <div className="pagination">
            <div className="pagination-info">Showing {((pagination.page-1)*pagination.limit)+1}–{Math.min(pagination.page*pagination.limit,pagination.total)} of {pagination.total}</div>
            <div className="pagination-controls">
              <button className="page-btn" disabled={pagination.page<=1} onClick={()=>load(pagination.page-1)}>‹</button>
              <button className="page-btn active">{pagination.page}</button>
              <button className="page-btn" disabled={pagination.page>=pagination.pages} onClick={()=>load(pagination.page+1)}>›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminAuditLogs
