import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Eye, FileText } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const STATUS_BADGE = { active:'badge-success', dispensed:'badge-primary', cancelled:'badge-danger', expired:'badge-neutral' }

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page:1,limit:20,total:0,pages:1 })
  const [filters, setFilters] = useState({ search:'', status:'' })
  const [showModal, setShowModal] = useState(false)
  const [viewItem, setViewItem] = useState(null)
  const [patients, setPatients] = useState([])
  const [doctors,  setDoctors]  = useState([])
  const [form, setForm]         = useState({ patient_id:'', doctor_id:'', prescription_date: new Date().toISOString().split('T')[0], diagnosis:'', notes:'', items:[{ medicine_name:'', dosage:'', frequency:'', duration:'' }] })
  const [saving, setSaving]     = useState(false)

  const load = useCallback(async (page=1) => {
    setLoading(true)
    try {
      const { data } = await api.get('/prescriptions', { params: { page, limit:20, ...filters } })
      setPrescriptions(data.data); setPagination(data.pagination)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { load(1) }, [filters])

  const openNewModal = async () => {
    try {
      const [pRes, dRes] = await Promise.all([api.get('/patients?limit=100'), api.get('/doctors?limit=100')])
      setPatients(pRes.data.data); setDoctors(dRes.data.data)
      setViewItem(null); setShowModal(true)
    } catch {}
  }

  const addItem = () => setForm(f=>({...f, items:[...f.items,{ medicine_name:'', dosage:'', frequency:'', duration:'' }]}))
  const setItem = (idx, k, v) => setForm(f=>({...f, items: f.items.map((it,i)=>i===idx?{...it,[k]:v}:it)}))

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.patient_id||!form.doctor_id) return toast.error('Select patient and doctor')
    setSaving(true)
    try {
      await api.post('/prescriptions', form)
      toast.success('Prescription created'); setShowModal(false); load(pagination.page)
    } catch (err) { toast.error(err.response?.data?.message||'Failed') }
    finally { setSaving(false) }
  }

  return (
    <div>
      <div className="page-header">
        <div><h2 className="page-title">Prescriptions</h2><p className="page-subtitle">{pagination.total} prescriptions</p></div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={openNewModal} id="new-rx-btn"><Plus size={14}/> New Prescription</button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-wrap"><Search size={16} className="search-icon"/><input placeholder="Search prescription, patient…" value={filters.search} onChange={e=>setFilters(f=>({...f,search:e.target.value}))}/></div>
        <select className="form-control" style={{width:'auto'}} value={filters.status} onChange={e=>setFilters(f=>({...f,status:e.target.value}))}>
          <option value="">All Status</option><option value="active">Active</option><option value="dispensed">Dispensed</option><option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead><tr><th>Rx Number</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Diagnosis</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {loading ? Array(6).fill(0).map((_,i)=><tr key={i}>{Array(7).fill(0).map((__,j)=><td key={j}><div className="skeleton" style={{height:16,borderRadius:4}}/></td>)}</tr>) :
             prescriptions.length===0 ? <tr><td colSpan={7} style={{textAlign:'center',padding:48,color:'var(--text-muted)'}}><FileText size={40} style={{opacity:0.3,display:'block',margin:'0 auto 8px'}}/>No prescriptions found</td></tr> :
             prescriptions.map(rx=>(
              <motion.tr key={rx.id} initial={{opacity:0}} animate={{opacity:1}}>
                <td><span className="font-mono" style={{color:'var(--color-accent)',fontSize:'0.82rem'}}>{rx.prescription_number}</span></td>
                <td style={{fontWeight:600,fontSize:'0.875rem'}}>{rx.patient_name}</td>
                <td style={{color:'var(--text-secondary)'}}>{rx.doctor_name}</td>
                <td style={{color:'var(--text-muted)',fontSize:'0.82rem'}}>{new Date(rx.prescription_date).toLocaleDateString('en-IN')}</td>
                <td style={{fontSize:'0.82rem',maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{rx.diagnosis||'—'}</td>
                <td><span className={`badge ${STATUS_BADGE[rx.status]||'badge-neutral'}`}>{rx.status}</span></td>
                <td><button className="btn btn-ghost btn-icon" id={`view-rx-${rx.id}`}><Eye size={14}/></button></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && !viewItem && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <motion.div className="modal" style={{maxWidth:620}} initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}}>
            <div className="modal-header"><h3 className="modal-title">New Prescription</h3><button className="btn btn-ghost btn-icon" onClick={()=>setShowModal(false)}>✕</button></div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="grid-2" style={{gap:14}}>
                  <div className="form-group" style={{marginBottom:0}}><label className="form-label">Patient *</label><select className="form-control" value={form.patient_id} onChange={e=>setForm(f=>({...f,patient_id:e.target.value}))}><option value="">Select Patient</option>{patients.map(p=><option key={p.id} value={p.id}>{p.full_name} ({p.patient_id})</option>)}</select></div>
                  <div className="form-group" style={{marginBottom:0}}><label className="form-label">Doctor *</label><select className="form-control" value={form.doctor_id} onChange={e=>setForm(f=>({...f,doctor_id:e.target.value}))}><option value="">Select Doctor</option>{doctors.map(d=><option key={d.id} value={d.id}>{d.full_name} - {d.specialization}</option>)}</select></div>
                  <div className="form-group" style={{marginBottom:0}}><label className="form-label">Date</label><input type="date" className="form-control" value={form.prescription_date} onChange={e=>setForm(f=>({...f,prescription_date:e.target.value}))}/></div>
                  <div className="form-group" style={{marginBottom:0}}><label className="form-label">Diagnosis</label><input type="text" className="form-control" value={form.diagnosis} onChange={e=>setForm(f=>({...f,diagnosis:e.target.value}))}/></div>
                </div>

                <div style={{marginTop:16}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                    <label className="form-label" style={{margin:0}}>Medicines</label>
                    <button type="button" className="btn btn-outline btn-sm" onClick={addItem}><Plus size={12}/> Add</button>
                  </div>
                  {form.items.map((it,idx)=>(
                    <div key={idx} style={{background:'var(--bg-surface-2)',borderRadius:'var(--radius-md)',padding:12,marginBottom:8}}>
                      <div className="grid-2" style={{gap:10}}>
                        <input type="text" className="form-control" placeholder="Medicine name" value={it.medicine_name} onChange={e=>setItem(idx,'medicine_name',e.target.value)}/>
                        <input type="text" className="form-control" placeholder="Dosage (e.g. 500mg)" value={it.dosage} onChange={e=>setItem(idx,'dosage',e.target.value)}/>
                        <input type="text" className="form-control" placeholder="Frequency (e.g. TDS)" value={it.frequency} onChange={e=>setItem(idx,'frequency',e.target.value)}/>
                        <input type="text" className="form-control" placeholder="Duration (e.g. 7 days)" value={it.duration} onChange={e=>setItem(idx,'duration',e.target.value)}/>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="form-group" style={{marginTop:14,marginBottom:0}}><label className="form-label">Notes</label><textarea className="form-control" rows={2} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={()=>setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving} id="save-rx-btn">{saving?'Creating…':'Create Prescription'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Prescriptions
