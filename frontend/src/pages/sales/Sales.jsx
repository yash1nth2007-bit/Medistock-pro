import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, Search, Eye, Download, Calendar } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const PAY_BADGE = { paid:'badge-success', partial:'badge-warning', pending:'badge-danger', refunded:'badge-neutral' }

const Sales = () => {
  const [sales, setSales]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [pagination, setPagination] = useState({ page:1,limit:20,total:0,pages:1 })
  const [filters, setFilters]     = useState({ search:'', from_date:'', to_date:'', payment_status:'' })
  const [dailySummary, setDailySummary] = useState(null)
  const navigate = useNavigate()

  const load = useCallback(async (page=1) => {
    setLoading(true)
    try {
      const [salesRes, dailyRes] = await Promise.all([
        api.get('/sales', { params: { page, limit:20, ...filters } }),
        api.get('/sales/daily-report')
      ])
      setSales(salesRes.data.data)
      setPagination(salesRes.data.pagination)
      setDailySummary(dailyRes.data.data.summary)
    } catch { toast.error('Failed to load sales') }
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { load(1) }, [filters])

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Sales Management</h2>
          <p className="page-subtitle">{pagination.total} total sales</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm" id="export-sales-btn"><Download size={14}/> Export</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/sales/pos')} id="new-sale-btn">
            <ShoppingCart size={14}/> POS Billing
          </button>
        </div>
      </div>

      {/* Today's Summary */}
      {dailySummary && (
        <div className="kpi-grid" style={{ marginBottom:20 }}>
          <div className="kpi-card success">
            <div className="kpi-icon success"><Calendar size={22}/></div>
            <div className="kpi-value">₹{parseFloat(dailySummary.revenue||0).toLocaleString('en-IN')}</div>
            <div className="kpi-label">Today's Revenue</div>
          </div>
          <div className="kpi-card primary">
            <div className="kpi-icon primary"><ShoppingCart size={22}/></div>
            <div className="kpi-value">{dailySummary.total_sales||0}</div>
            <div className="kpi-label">Today's Sales</div>
          </div>
          <div className="kpi-card accent">
            <div className="kpi-icon accent">%</div>
            <div className="kpi-value">₹{parseFloat(dailySummary.tax||0).toLocaleString('en-IN')}</div>
            <div className="kpi-label">Today's GST Collected</div>
          </div>
        </div>
      )}

      <div className="filter-bar">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input placeholder="Search invoice, patient…" value={filters.search} onChange={e => setFilters(f=>({...f,search:e.target.value}))} />
        </div>
        <input type="date" className="form-control" style={{width:'auto'}} value={filters.from_date} onChange={e => setFilters(f=>({...f,from_date:e.target.value}))} />
        <input type="date" className="form-control" style={{width:'auto'}} value={filters.to_date}   onChange={e => setFilters(f=>({...f,to_date:e.target.value}))} />
        <select className="form-control" style={{width:'auto'}} value={filters.payment_status} onChange={e => setFilters(f=>({...f,payment_status:e.target.value}))}>
          <option value="">All Payments</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr><th>Invoice</th><th>Patient</th><th>Date & Time</th><th>Items</th><th>Total</th><th>Method</th><th>Payment</th><th>By</th><th></th></tr>
          </thead>
          <tbody>
            {loading ? Array(8).fill(0).map((_,i) => (
              <tr key={i}>{Array(9).fill(0).map((__,j) => <td key={j}><div className="skeleton" style={{ height:16,borderRadius:4 }} /></td>)}</tr>
            )) : sales.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign:'center',padding:48,color:'var(--text-muted)' }}>
                <ShoppingCart size={36} style={{ opacity:0.3,marginBottom:8,display:'block',margin:'0 auto 8px' }} />
                No sales found
              </td></tr>
            ) : sales.map(s => (
              <motion.tr key={s.id} initial={{ opacity:0 }} animate={{ opacity:1 }}>
                <td><span className="font-mono" style={{ color:'var(--color-accent)',fontSize:'0.82rem' }}>{s.invoice_number}</span></td>
                <td style={{ fontWeight:600, fontSize:'0.875rem' }}>{s.patient_name || <span style={{ color:'var(--text-muted)',fontWeight:400 }}>Walk-in</span>}</td>
                <td style={{ color:'var(--text-muted)',fontSize:'0.78rem' }}>
                  {new Date(s.sale_date).toLocaleDateString('en-IN')}
                  {s.sale_time && <span style={{ display:'block' }}>{s.sale_time.slice(0,5)}</span>}
                </td>
                <td style={{ color:'var(--text-muted)' }}>—</td>
                <td style={{ fontWeight:700, color:'var(--color-success)' }}>₹{parseFloat(s.total_amount).toLocaleString('en-IN')}</td>
                <td><span className="badge badge-info" style={{ textTransform:'capitalize' }}>{s.payment_method}</span></td>
                <td><span className={`badge ${PAY_BADGE[s.payment_status]||'badge-neutral'}`}>{s.payment_status}</span></td>
                <td style={{ fontSize:'0.78rem',color:'var(--text-muted)' }}>{s.created_by_name}</td>
                <td>
                  <button className="btn btn-ghost btn-icon" id={`view-sale-${s.id}`}><Eye size={15}/></button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {!loading && pagination.total > pagination.limit && (
          <div className="pagination">
            <div className="pagination-info">Showing {((pagination.page-1)*pagination.limit)+1}–{Math.min(pagination.page*pagination.limit,pagination.total)} of {pagination.total}</div>
            <div className="pagination-controls">
              <button className="page-btn" disabled={pagination.page<=1} onClick={() => load(pagination.page-1)}>‹</button>
              <button className="page-btn active">{pagination.page}</button>
              <button className="page-btn" disabled={pagination.page>=pagination.pages} onClick={() => load(pagination.page+1)}>›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sales
