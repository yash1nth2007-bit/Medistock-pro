import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Filter, Download, Upload, RefreshCw, Edit2, Trash2, Eye, MoreVertical, Package } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

const STATUS_BADGE = { active:'badge-success', inactive:'badge-neutral', discontinued:'badge-danger' }
const STOCK_BADGE  = { ok:'badge-success', low_stock:'badge-warning', out_of_stock:'badge-danger', expired:'badge-danger', near_expiry:'badge-warning' }
const STOCK_LABEL  = { ok:'In Stock', low_stock:'Low Stock', out_of_stock:'Out of Stock', expired:'Expired', near_expiry:'Near Expiry' }

const Medicines = () => {
  const [medicines, setMedicines]   = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [pagination, setPagination] = useState({ page:1, limit:20, total:0, pages:1 })
  const [filters, setFilters]       = useState({ search:'', category_id:'', status:'', expiry_status:'', low_stock:'', sort:'name', order:'ASC' })
  const [openMenu, setOpenMenu]     = useState(null)
  const navigate = useNavigate()

  const load = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, limit: pagination.limit, ...filters }
      const [medsRes, catsRes] = await Promise.all([
        api.get('/medicines', { params }),
        categories.length === 0 ? api.get('/categories') : Promise.resolve({ data: { data: categories } })
      ])
      setMedicines(medsRes.data.data)
      setPagination(medsRes.data.pagination)
      if (categories.length === 0) setCategories(catsRes.data.data)
    } catch { toast.error('Failed to load medicines') }
    finally { setLoading(false) }
  }, [filters, pagination.limit])

  useEffect(() => { load(1) }, [filters])

  const handleDelete = async (med) => {
    const result = await Swal.fire({
      title: 'Discontinue Medicine?',
      html: `<p style="color:#94A3B8">This will mark <strong style="color:#F8FAFC">${med.name}</strong> as discontinued.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Discontinue',
      cancelButtonText: 'Cancel',
      background: '#1E293B',
      color: '#F8FAFC',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#334155',
      borderRadius: '12px',
    })
    if (!result.isConfirmed) return
    try {
      await api.delete(`/medicines/${med.id}`)
      toast.success(`${med.name} discontinued`)
      load(pagination.page)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete') }
  }

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }))

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Medicine Inventory</h2>
          <p className="page-subtitle">{pagination.total} medicines total</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm" onClick={() => load(pagination.page)}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="btn btn-outline btn-sm" id="export-medicines-btn">
            <Download size={14} /> Export
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/medicines/new')} id="add-medicine-btn">
            <Plus size={14} /> Add Medicine
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search name, barcode, generic…"
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
            id="medicine-search"
          />
        </div>
        <select className="form-control" style={{ width:'auto' }} value={filters.category_id} onChange={e => setFilter('category_id', e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="form-control" style={{ width:'auto' }} value={filters.expiry_status} onChange={e => setFilter('expiry_status', e.target.value)}>
          <option value="">All Expiry</option>
          <option value="expired">Expired</option>
          <option value="near_30">Near Expiry (30d)</option>
          <option value="near_60">Near Expiry (60d)</option>
          <option value="near_90">Near Expiry (90d)</option>
        </select>
        <select className="form-control" style={{ width:'auto' }} value={filters.low_stock} onChange={e => setFilter('low_stock', e.target.value)}>
          <option value="">All Stock</option>
          <option value="true">Low Stock Only</option>
        </select>
        {Object.values(filters).some(v => v) && (
          <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ search:'',category_id:'',status:'',expiry_status:'',low_stock:'',sort:'name',order:'ASC' })}>
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Category</th>
              <th>Batch / Expiry</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? Array(8).fill(0).map((_, i) => (
              <tr key={i}>{Array(7).fill(0).map((__, j) => (
                <td key={j}><div className="skeleton" style={{ height:16,borderRadius:4,width:j===0?120:80 }} /></td>
              ))}</tr>
            )) : medicines.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign:'center', padding:48, color:'var(--text-muted)' }}>
                  <Package size={40} style={{ marginBottom:12, opacity:0.3 }} />
                  <div>No medicines found</div>
                </td>
              </tr>
            ) : medicines.map(med => (
              <motion.tr key={med.id} initial={{ opacity:0 }} animate={{ opacity:1 }}>
                <td>
                  <div style={{ fontWeight:600, color:'var(--text-primary)', fontSize:'0.875rem' }}>{med.name}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{med.generic_name || med.medicine_id}</div>
                </td>
                <td><span style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>{med.category_name || '—'}</span></td>
                <td>
                  <div style={{ fontSize:'0.8rem', fontFamily:'var(--font-mono)', color:'var(--text-secondary)' }}>{med.batch_number || '—'}</div>
                  <div style={{ fontSize:'0.75rem', color: med.days_to_expiry < 30 ? 'var(--color-warning)' : 'var(--text-muted)' }}>
                    {med.expiry_date ? new Date(med.expiry_date).toLocaleDateString('en-IN') : '—'}
                    {med.days_to_expiry <= 30 && med.days_to_expiry >= 0 && <span> ⚠ {med.days_to_expiry}d</span>}
                  </div>
                </td>
                <td>
                  <span className={`badge ${STOCK_BADGE[med.stock_status] || 'badge-neutral'}`}>
                    {STOCK_LABEL[med.stock_status] || med.stock_status}
                  </span>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:3 }}>{med.quantity} {med.unit}</div>
                </td>
                <td>
                  <div style={{ fontWeight:600, fontSize:'0.875rem' }}>₹{parseFloat(med.selling_price).toLocaleString('en-IN')}</div>
                  <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>Cost: ₹{parseFloat(med.purchase_price).toLocaleString('en-IN')}</div>
                </td>
                <td><span className={`badge ${STATUS_BADGE[med.status]}`}>{med.status}</span></td>
                <td>
                  <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate(`/medicines/${med.id}`)} data-tooltip="View" id={`view-med-${med.id}`}>
                      <Eye size={15} />
                    </button>
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate(`/medicines/${med.id}/edit`)} data-tooltip="Edit" id={`edit-med-${med.id}`}>
                      <Edit2 size={15} />
                    </button>
                    <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(med)} style={{ color:'var(--color-danger)' }} data-tooltip="Delete" id={`del-med-${med.id}`}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {!loading && pagination.total > pagination.limit && (
          <div className="pagination">
            <div className="pagination-info">
              Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </div>
            <div className="pagination-controls">
              <button className="page-btn" disabled={pagination.page <= 1} onClick={() => load(pagination.page - 1)}>‹</button>
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                const page = i + Math.max(1, pagination.page - 2)
                if (page > pagination.pages) return null
                return (
                  <button key={page} className={`page-btn ${page === pagination.page ? 'active' : ''}`} onClick={() => load(page)}>{page}</button>
                )
              })}
              <button className="page-btn" disabled={pagination.page >= pagination.pages} onClick={() => load(pagination.page + 1)}>›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Medicines
