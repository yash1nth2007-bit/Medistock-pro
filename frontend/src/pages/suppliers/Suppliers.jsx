import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, Eye, Building2, Phone, Mail, MapPin } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading]     = useState(true)
  const [pagination, setPagination] = useState({ page:1,limit:20,total:0 })
  const [filters, setFilters]     = useState({ search:'', status:'' })
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem]   = useState(null)
  const [form, setForm]           = useState({})
  const [saving, setSaving]       = useState(false)

  const load = useCallback(async (page=1) => {
    setLoading(true)
    try {
      const { data } = await api.get('/suppliers', { params: { page, limit:20, ...filters } })
      setSuppliers(data.data)
      setPagination(data.pagination)
    } catch { toast.error('Failed to load suppliers') }
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { load(1) }, [filters])

  const openModal = (item=null) => {
    setEditItem(item)
    setForm(item ? { ...item } : { name:'',company_name:'',contact_person:'',phone:'',email:'',gst_number:'',address:'',city:'',state:'',credit_limit:'0' })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) return toast.error('Name and phone required')
    setSaving(true)
    try {
      if (editItem) { await api.put(`/suppliers/${editItem.id}`, form); toast.success('Supplier updated') }
      else          { await api.post('/suppliers', form);              toast.success('Supplier added') }
      setShowModal(false); load(pagination.page)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async (s) => {
    const r = await Swal.fire({ title:'Deactivate Supplier?', text:s.name, icon:'warning', showCancelButton:true, confirmButtonText:'Deactivate', confirmButtonColor:'#EF4444', background:'#1E293B', color:'#F8FAFC' })
    if (!r.isConfirmed) return
    try { await api.delete(`/suppliers/${s.id}`); toast.success('Deactivated'); load(pagination.page) }
    catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Suppliers</h2>
          <p className="page-subtitle">{pagination.total} suppliers total</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={() => openModal()} id="add-supplier-btn">
            <Plus size={14}/> Add Supplier
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input placeholder="Search suppliers…" value={filters.search} onChange={e => setFilters(f=>({...f,search:e.target.value}))} />
        </div>
        <select className="form-control" style={{width:'auto'}} value={filters.status} onChange={e => setFilters(f=>({...f,status:e.target.value}))}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="grid-3">
        {loading ? Array(6).fill(0).map((_,i) => (
          <div key={i} className="card">
            <div className="skeleton" style={{ height:20,marginBottom:10 }} />
            <div className="skeleton" style={{ height:14,width:'70%',marginBottom:8 }} />
            <div className="skeleton" style={{ height:14,width:'50%' }} />
          </div>
        )) : suppliers.map(s => (
          <motion.div key={s.id} className="card" initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:40,height:40,borderRadius:'var(--radius-md)',background:'rgba(20,184,166,0.12)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <Building2 size={18} style={{ color:'var(--color-secondary)' }} />
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:'0.9rem' }}>{s.name}</div>
                  <div style={{ fontSize:'0.75rem',color:'var(--text-muted)' }}>{s.supplier_code}</div>
                </div>
              </div>
              <span className={`badge ${s.status==='active'?'badge-success':'badge-neutral'}`}>{s.status}</span>
            </div>

            {s.company_name && <p style={{ fontSize:'0.8rem',color:'var(--text-secondary)',marginBottom:10 }}>{s.company_name}</p>}

            <div style={{ display:'flex',flexDirection:'column',gap:6,marginBottom:16 }}>
              {s.phone && <span style={{ fontSize:'0.78rem',color:'var(--text-muted)',display:'flex',alignItems:'center',gap:6 }}><Phone size={12}/> {s.phone}</span>}
              {s.email && <span style={{ fontSize:'0.78rem',color:'var(--text-muted)',display:'flex',alignItems:'center',gap:6 }}><Mail size={12}/> {s.email}</span>}
              {s.city  && <span style={{ fontSize:'0.78rem',color:'var(--text-muted)',display:'flex',alignItems:'center',gap:6 }}><MapPin size={12}/> {s.city}, {s.state}</span>}
            </div>

            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:12,borderTop:'1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontSize:'0.72rem',color:'var(--text-muted)' }}>Total Purchases</div>
                <div style={{ fontWeight:700,color:'var(--color-secondary)',fontSize:'0.875rem' }}>
                  ₹{parseFloat(s.total_amount||0).toLocaleString('en-IN')} ({s.total_purchases||0})
                </div>
              </div>
              <div style={{ display:'flex',gap:6 }}>
                <button className="btn btn-ghost btn-icon" onClick={() => openModal(s)} id={`edit-sup-${s.id}`}><Edit2 size={14}/></button>
                <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(s)} style={{ color:'var(--color-danger)' }} id={`del-sup-${s.id}`}><Trash2 size={14}/></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <motion.div className="modal" initial={{ opacity:0,scale:0.96 }} animate={{ opacity:1,scale:1 }}>
            <div className="modal-header">
              <h3 className="modal-title">{editItem ? 'Edit Supplier' : 'Add Supplier'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="grid-2" style={{ gap:16 }}>
                  {[['name','Supplier Name *','text'],['company_name','Company Name','text'],['contact_person','Contact Person','text'],['phone','Phone *','tel'],['email','Email','email'],['gst_number','GST Number','text'],['city','City','text'],['state','State','text']].map(([k,l,t]) => (
                    <div key={k} className="form-group" style={{ marginBottom:0 }}>
                      <label className="form-label">{l}</label>
                      <input type={t} className="form-control" value={form[k]||''} onChange={e => set(k,e.target.value)} />
                    </div>
                  ))}
                </div>
                <div className="form-group" style={{ marginTop:16 }}>
                  <label className="form-label">Address</label>
                  <textarea className="form-control" rows={2} value={form.address||''} onChange={e => set('address',e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving} id="save-supplier-btn">
                  {saving ? 'Saving…' : editItem ? 'Update' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Suppliers
