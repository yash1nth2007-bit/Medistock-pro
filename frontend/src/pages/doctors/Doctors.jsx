import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, Stethoscope } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

const EMPTY = { full_name:'', specialization:'', qualification:'', experience_years:'', phone:'', email:'', license_number:'', consultation_fee:'', bio:'' }

const Doctors = () => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page:1,limit:20,total:0,pages:1 })
  const [filters, setFilters] = useState({ search:'', specialization:'' })
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem]   = useState(null)
  const [form, setForm]           = useState(EMPTY)
  const [saving, setSaving]       = useState(false)

  const load = useCallback(async (page=1) => {
    setLoading(true)
    try {
      const { data } = await api.get('/doctors', { params: { page, limit:20, ...filters } })
      setDoctors(data.data); setPagination(data.pagination)
    } catch { toast.error('Failed to load doctors') }
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { load(1) }, [filters])

  const openModal = (item=null) => {
    setEditItem(item)
    setForm(item ? { full_name:item.full_name||'',specialization:item.specialization||'',qualification:item.qualification||'',experience_years:item.experience_years||'',phone:item.phone||'',email:item.email||'',license_number:item.license_number||'',consultation_fee:item.consultation_fee||'',bio:item.bio||'' } : EMPTY)
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.full_name) return toast.error('Doctor name required')
    setSaving(true)
    try {
      if (editItem) { await api.put(`/doctors/${editItem.id}`, form); toast.success('Doctor updated') }
      else          { await api.post('/doctors', form);              toast.success('Doctor added') }
      setShowModal(false); load(pagination.page)
    } catch (err) { toast.error(err.response?.data?.message||'Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (d) => {
    const r = await Swal.fire({ title:`Deactivate Dr. ${d.full_name}?`,icon:'warning',showCancelButton:true,confirmButtonText:'Deactivate',confirmButtonColor:'#EF4444',background:'#1E293B',color:'#F8FAFC' })
    if (!r.isConfirmed) return
    try { await api.delete(`/doctors/${d.id}`); toast.success('Doctor deactivated'); load() }
    catch { toast.error('Failed') }
  }

  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const SPECIALIZATIONS = ['General Physician','Cardiologist','Diabetologist','Neurologist','Orthopedist','Gynecologist','Pediatrician','Dermatologist','Psychiatrist','Ophthalmologist','ENT','Pulmonologist','Gastroenterologist','Oncologist','Urologist']

  return (
    <div>
      <div className="page-header">
        <div><h2 className="page-title">Doctor Management</h2><p className="page-subtitle">{pagination.total} doctors</p></div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={()=>openModal()} id="add-doctor-btn"><Plus size={14}/> Add Doctor</button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-wrap"><Search size={16} className="search-icon"/><input placeholder="Search doctor, specialization…" value={filters.search} onChange={e=>setFilters(f=>({...f,search:e.target.value}))}/></div>
        <select className="form-control" style={{width:'auto'}} value={filters.specialization} onChange={e=>setFilters(f=>({...f,specialization:e.target.value}))}>
          <option value="">All Specializations</option>{SPECIALIZATIONS.map(s=><option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="grid-3">
        {loading ? Array(6).fill(0).map((_,i)=>(
          <div key={i} className="card"><div className="skeleton" style={{height:20,marginBottom:10}}/><div className="skeleton" style={{height:14,width:'60%',marginBottom:8}}/><div className="skeleton" style={{height:14,width:'80%'}}/></div>
        )) : doctors.length === 0 ? (
          <div style={{gridColumn:'span 3',textAlign:'center',padding:60,color:'var(--text-muted)'}}><Stethoscope size={48} style={{opacity:0.2,marginBottom:12,display:'block',margin:'0 auto 12px'}}/><p>No doctors found</p></div>
        ) : doctors.map(doc => (
          <motion.div key={doc.id} className="card" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg,var(--color-secondary),var(--color-accent))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',fontWeight:700,color:'#fff',flexShrink:0}}>
                  {doc.full_name.split(' ').filter(n=>n.toLowerCase()!=='dr.').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
                </div>
                <div>
                  <div style={{fontWeight:700,fontSize:'0.9rem'}}>{doc.full_name}</div>
                  <div style={{fontSize:'0.72rem',fontFamily:'var(--font-mono)',color:'var(--text-muted)'}}>{doc.doctor_id}</div>
                </div>
              </div>
              <span className={`badge ${doc.status==='active'?'badge-success':'badge-neutral'}`}>{doc.status}</span>
            </div>

            <div style={{background:'var(--bg-surface-2)',borderRadius:'var(--radius-md)',padding:'10px 14px',marginBottom:14}}>
              <div style={{fontWeight:600,fontSize:'0.85rem',color:'var(--color-secondary)'}}>{doc.specialization||'—'}</div>
              <div style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>{doc.qualification||'—'}</div>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:14,fontSize:'0.78rem',color:'var(--text-muted)'}}>
              {doc.experience_years>0 && <span>🎓 {doc.experience_years} years experience</span>}
              {doc.phone && <span>📞 {doc.phone}</span>}
              {doc.license_number && <span>🪪 {doc.license_number}</span>}
              {doc.consultation_fee>0 && <span>💰 ₹{parseFloat(doc.consultation_fee).toLocaleString('en-IN')} consultation</span>}
            </div>

            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:12,borderTop:'1px solid var(--border-color)'}}>
              <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{doc.total_prescriptions||0} prescriptions</div>
              <div style={{display:'flex',gap:6}}>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={()=>openModal(doc)} id={`edit-doc-${doc.id}`}><Edit2 size={14}/></button>
                <button className="btn btn-ghost btn-icon btn-sm" style={{color:'var(--color-danger)'}} onClick={()=>handleDelete(doc)} id={`del-doc-${doc.id}`}><Trash2 size={14}/></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <motion.div className="modal" style={{maxWidth:580}} initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}}>
            <div className="modal-header">
              <h3 className="modal-title">{editItem?'Edit Doctor':'Add Doctor'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="grid-2" style={{gap:14}}>
                  {[['full_name','Full Name *','text'],['phone','Phone','tel'],['email','Email','email'],['license_number','License #','text'],['experience_years','Experience (years)','number'],['consultation_fee','Consultation Fee (₹)','number']].map(([k,l,t])=>(
                    <div key={k} className="form-group" style={{marginBottom:0}}><label className="form-label">{l}</label><input type={t} className="form-control" value={form[k]||''} onChange={e=>set(k,e.target.value)}/></div>
                  ))}
                  <div className="form-group" style={{marginBottom:0}}>
                    <label className="form-label">Specialization</label>
                    <select className="form-control" value={form.specialization} onChange={e=>set('specialization',e.target.value)}>
                      <option value="">Select</option>{SPECIALIZATIONS.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{marginBottom:0}}>
                    <label className="form-label">Qualification</label>
                    <input type="text" className="form-control" placeholder="e.g. MBBS, MD" value={form.qualification||''} onChange={e=>set('qualification',e.target.value)}/>
                  </div>
                </div>
                <div className="form-group" style={{marginTop:14,marginBottom:0}}>
                  <label className="form-label">Bio</label>
                  <textarea className="form-control" rows={2} value={form.bio||''} onChange={e=>set('bio',e.target.value)}/>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={()=>setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving} id="save-doctor-btn">{saving?'Saving…':editItem?'Update':'Add Doctor'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Doctors
