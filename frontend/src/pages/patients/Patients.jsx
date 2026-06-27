import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search, Eye, Edit2, Trash2, Users } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

const BLOOD = ['A+','A-','B+','B-','AB+','AB-','O+','O-']
const GENDERS = ['male','female','other']

const EMPTY = { full_name:'',age:'',gender:'male',blood_group:'',phone:'',email:'',address:'',city:'',state:'',allergies:'',medical_history:'' }

const Patients = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading]   = useState(true)
  const [pagination, setPagination] = useState({ page:1,limit:20,total:0,pages:1 })
  const [filters, setFilters]   = useState({ search:'',gender:'',blood_group:'' })
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm]         = useState(EMPTY)
  const [saving, setSaving]     = useState(false)
  const navigate = useNavigate()

  const load = useCallback(async (page=1) => {
    setLoading(true)
    try {
      const { data } = await api.get('/patients', { params: { page, limit:20, ...filters } })
      setPatients(data.data); setPagination(data.pagination)
    } catch { toast.error('Failed to load patients') }
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { load(1) }, [filters])

  const openModal = (item=null) => {
    setEditItem(item)
    setForm(item ? { full_name:item.full_name||'',age:item.age||'',gender:item.gender||'male',blood_group:item.blood_group||'',phone:item.phone||'',email:item.email||'',address:item.address||'',city:item.city||'',state:item.state||'',allergies:item.allergies||'',medical_history:item.medical_history||'' } : EMPTY)
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.full_name||!form.phone||!form.gender) return toast.error('Name, phone, gender required')
    setSaving(true)
    try {
      if (editItem) { await api.put(`/patients/${editItem.id}`, form); toast.success('Patient updated') }
      else          { await api.post('/patients', form);              toast.success('Patient added') }
      setShowModal(false); load(pagination.page)
    } catch (err) { toast.error(err.response?.data?.message||'Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (p) => {
    const r = await Swal.fire({ title:'Deactivate Patient?',text:p.full_name,icon:'warning',showCancelButton:true,confirmButtonText:'Deactivate',confirmButtonColor:'#EF4444',background:'#1E293B',color:'#F8FAFC' })
    if (!r.isConfirmed) return
    try { await api.delete(`/patients/${p.id}`); toast.success('Patient deactivated'); load(pagination.page) }
    catch { toast.error('Failed') }
  }

  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  return (
    <div>
      <div className="page-header">
        <div><h2 className="page-title">Patient Management</h2><p className="page-subtitle">{pagination.total} patients registered</p></div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={() => openModal()} id="add-patient-btn"><Plus size={14}/> Add Patient</button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-wrap"><Search size={16} className="search-icon" /><input placeholder="Search name, phone, ID…" value={filters.search} onChange={e => setFilters(f=>({...f,search:e.target.value}))} /></div>
        <select className="form-control" style={{width:'auto'}} value={filters.gender} onChange={e => setFilters(f=>({...f,gender:e.target.value}))}>
          <option value="">All Genders</option>{GENDERS.map(g=><option key={g} value={g} style={{textTransform:'capitalize'}}>{g}</option>)}
        </select>
        <select className="form-control" style={{width:'auto'}} value={filters.blood_group} onChange={e => setFilters(f=>({...f,blood_group:e.target.value}))}>
          <option value="">Blood Group</option>{BLOOD.map(b=><option key={b}>{b}</option>)}
        </select>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead><tr><th>Patient</th><th>Age/Gender</th><th>Blood</th><th>Contact</th><th>Allergies</th><th>Records</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? Array(8).fill(0).map((_,i)=><tr key={i}>{Array(7).fill(0).map((__,j)=><td key={j}><div className="skeleton" style={{height:16,borderRadius:4}}/></td>)}</tr>) :
             patients.length===0 ? <tr><td colSpan={7} style={{textAlign:'center',padding:48,color:'var(--text-muted)'}}>
               <Users size={40} style={{opacity:0.3,display:'block',margin:'0 auto 8px'}}/>No patients found</td></tr> :
             patients.map(p => (
              <motion.tr key={p.id} initial={{opacity:0}} animate={{opacity:1}}>
                <td>
                  <div style={{fontWeight:600,fontSize:'0.875rem'}}>{p.full_name}</div>
                  <div style={{fontSize:'0.75rem',color:'var(--text-muted)',fontFamily:'var(--font-mono)'}}>{p.patient_id}</div>
                </td>
                <td><div style={{fontSize:'0.85rem'}}>{p.age||'—'} yrs</div><span className="badge badge-info" style={{fontSize:'0.65rem',textTransform:'capitalize'}}>{p.gender}</span></td>
                <td>{p.blood_group ? <span className="badge badge-danger">{p.blood_group}</span> : '—'}</td>
                <td><div style={{fontSize:'0.8rem'}}>{p.phone}</div><div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{p.email||'—'}</div></td>
                <td style={{fontSize:'0.78rem',color:'var(--color-warning)',maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.allergies||'None'}</td>
                <td>
                  <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{p.total_prescriptions||0} Rx</div>
                  <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{p.total_purchases||0} Sales</div>
                </td>
                <td>
                  <div style={{display:'flex',gap:6}}>
                    <button className="btn btn-ghost btn-icon" onClick={()=>navigate(`/patients/${p.id}`)} id={`view-pat-${p.id}`}><Eye size={14}/></button>
                    <button className="btn btn-ghost btn-icon" onClick={()=>openModal(p)} id={`edit-pat-${p.id}`}><Edit2 size={14}/></button>
                    <button className="btn btn-ghost btn-icon" style={{color:'var(--color-danger)'}} onClick={()=>handleDelete(p)} id={`del-pat-${p.id}`}><Trash2 size={14}/></button>
                  </div>
                </td>
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

      {showModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <motion.div className="modal" style={{maxWidth:640}} initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}}>
            <div className="modal-header">
              <h3 className="modal-title">{editItem?'Edit Patient':'Add Patient'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="grid-2" style={{gap:14}}>
                  {[['full_name','Full Name *','text'],['phone','Phone *','tel'],['email','Email','email'],['age','Age','number'],['city','City','text'],['state','State','text']].map(([k,l,t])=>(
                    <div key={k} className="form-group" style={{marginBottom:0}}>
                      <label className="form-label">{l}</label>
                      <input type={t} className="form-control" value={form[k]||''} onChange={e=>set(k,e.target.value)} />
                    </div>
                  ))}
                  <div className="form-group" style={{marginBottom:0}}>
                    <label className="form-label">Gender *</label>
                    <select className="form-control" value={form.gender} onChange={e=>set('gender',e.target.value)}>
                      {GENDERS.map(g=><option key={g} value={g} style={{textTransform:'capitalize'}}>{g}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{marginBottom:0}}>
                    <label className="form-label">Blood Group</label>
                    <select className="form-control" value={form.blood_group} onChange={e=>set('blood_group',e.target.value)}>
                      <option value="">Select</option>{BLOOD.map(b=><option key={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{marginTop:14}}>
                  <label className="form-label">Address</label>
                  <input type="text" className="form-control" value={form.address||''} onChange={e=>set('address',e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Allergies</label>
                  <input type="text" className="form-control" placeholder="e.g. Penicillin, Sulfa drugs" value={form.allergies||''} onChange={e=>set('allergies',e.target.value)} />
                </div>
                <div className="form-group" style={{marginBottom:0}}>
                  <label className="form-label">Medical History</label>
                  <textarea className="form-control" rows={2} value={form.medical_history||''} onChange={e=>set('medical_history',e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={()=>setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving} id="save-patient-btn">{saving?'Saving…':editItem?'Update':'Add Patient'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Patients
