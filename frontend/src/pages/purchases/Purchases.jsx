import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search, Eye, Calendar, Truck } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const STATUS_BADGE = { received:'badge-success',pending:'badge-warning',cancelled:'badge-danger',partial:'badge-info' }
const PAY_BADGE    = { paid:'badge-success',partial:'badge-warning',pending:'badge-danger' }

const Purchases = () => {
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading]     = useState(true)
  const [pagination, setPagination] = useState({ page:1,limit:20,total:0,pages:1 })
  const [filters, setFilters]     = useState({ search:'',from_date:'',to_date:'',status:'' })
  const navigate = useNavigate()

  const load = useCallback(async (page=1) => {
    setLoading(true)
    try {
      const { data } = await api.get('/purchases', { params: { page, limit:20, ...filters } })
      setPurchases(data.data)
      setPagination(data.pagination)
    } catch { toast.error('Failed to load purchases') }
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { load(1) }, [filters])

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Purchase Management</h2>
          <p className="page-subtitle">{pagination.total} purchase orders</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/purchases/new')} id="new-purchase-btn">
            <Plus size={14}/> New Purchase Order
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input placeholder="Search PO number, supplier…" value={filters.search} onChange={e => setFilters(f=>({...f,search:e.target.value}))} />
        </div>
        <input type="date" className="form-control" style={{width:'auto'}} value={filters.from_date} onChange={e => setFilters(f=>({...f,from_date:e.target.value}))} placeholder="From" />
        <input type="date" className="form-control" style={{width:'auto'}} value={filters.to_date}   onChange={e => setFilters(f=>({...f,to_date:e.target.value}))} placeholder="To" />
        <select className="form-control" style={{width:'auto'}} value={filters.status} onChange={e => setFilters(f=>({...f,status:e.target.value}))}>
          <option value="">All Status</option>
          <option value="received">Received</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr><th>PO Number</th><th>Supplier</th><th>Date</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? Array(6).fill(0).map((_,i) => (
              <tr key={i}>{Array(8).fill(0).map((__,j) => <td key={j}><div className="skeleton" style={{ height:16,borderRadius:4 }} /></td>)}</tr>
            )) : purchases.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign:'center',padding:40,color:'var(--text-muted)' }}>
                <Truck size={36} style={{ opacity:0.3,marginBottom:8,display:'block',margin:'0 auto 8px' }} />
                No purchase orders found
              </td></tr>
            ) : purchases.map(p => (
              <tr key={p.id}>
                <td><span className="font-mono" style={{ color:'var(--color-accent)',fontSize:'0.82rem' }}>{p.purchase_number}</span></td>
                <td style={{ fontWeight:600,fontSize:'0.875rem' }}>{p.supplier_name}</td>
                <td style={{ color:'var(--text-muted)',fontSize:'0.82rem' }}>
                  <Calendar size={12} style={{ marginRight:4,display:'inline' }} />
                  {new Date(p.purchase_date).toLocaleDateString('en-IN')}
                </td>
                <td style={{ color:'var(--text-muted)' }}>—</td>
                <td style={{ fontWeight:700 }}>₹{parseFloat(p.total_amount).toLocaleString('en-IN')}</td>
                <td><span className={`badge ${PAY_BADGE[p.payment_status]||'badge-neutral'}`}>{p.payment_status}</span></td>
                <td><span className={`badge ${STATUS_BADGE[p.status]||'badge-neutral'}`}>{p.status}</span></td>
                <td>
                  <button className="btn btn-ghost btn-icon" onClick={() => navigate(`/purchases/${p.id}`)} id={`view-po-${p.id}`}><Eye size={15}/></button>
                </td>
              </tr>
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

export default Purchases
