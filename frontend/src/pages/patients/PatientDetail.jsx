import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, User, Phone, Mail, MapPin, Heart, AlertTriangle, FileText, ShoppingCart } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const PatientDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/patients/${id}`)
      .then(r => setPatient(r.data.data))
      .catch(() => { toast.error('Patient not found'); navigate('/patients') })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:300}}><div className="spinner" style={{width:40,height:40,borderWidth:3}}/></div>
  if (!patient) return null

  const InfoItem = ({icon:Icon, label, value}) => value ? (
    <div style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 0',borderBottom:'1px solid var(--border-color)'}}>
      <Icon size={15} style={{color:'var(--text-muted)',marginTop:2,flexShrink:0}}/>
      <div><div style={{fontSize:'0.72rem',color:'var(--text-muted)',marginBottom:2}}>{label}</div><div style={{fontSize:'0.875rem',fontWeight:600,color:'var(--text-primary)'}}>{value}</div></div>
    </div>
  ) : null

  return (
    <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}>
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={()=>navigate('/patients')} style={{marginBottom:8}}><ArrowLeft size={16}/> Back</button>
          <h2 className="page-title">{patient.full_name}</h2>
          <p className="page-subtitle">{patient.patient_id} • {patient.gender} • {patient.age} years</p>
        </div>
        <div className="page-actions">
          {patient.allergies && <div className="alert alert-warning" style={{margin:0,padding:'8px 14px'}}><AlertTriangle size={14}/> Allergies: {patient.allergies}</div>}
        </div>
      </div>

      <div className="grid-3" style={{alignItems:'start'}}>
        <div className="card">
          <div style={{textAlign:'center',marginBottom:20}}>
            <div style={{width:72,height:72,borderRadius:'50%',background:'linear-gradient(135deg,var(--color-secondary),var(--color-accent))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.75rem',fontWeight:700,color:'#fff',margin:'0 auto 12px'}}>
              {patient.full_name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
            </div>
            <h3 style={{marginBottom:4}}>{patient.full_name}</h3>
            {patient.blood_group && <span className="badge badge-danger" style={{fontSize:'0.8rem'}}>{patient.blood_group}</span>}
          </div>
          <InfoItem icon={Phone}   label="Phone"   value={patient.phone}/>
          <InfoItem icon={Mail}    label="Email"   value={patient.email}/>
          <InfoItem icon={MapPin}  label="Address" value={[patient.address,patient.city,patient.state].filter(Boolean).join(', ')}/>
          {patient.allergies && (
            <div style={{marginTop:12,padding:12,background:'rgba(239,68,68,0.08)',borderRadius:'var(--radius-md)',border:'1px solid rgba(239,68,68,0.2)'}}>
              <div style={{fontSize:'0.72rem',color:'var(--color-danger)',fontWeight:700,marginBottom:4}}>⚠ ALLERGIES</div>
              <div style={{fontSize:'0.85rem',color:'var(--text-primary)'}}>{patient.allergies}</div>
            </div>
          )}
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="card">
            <h4 style={{marginBottom:14}}>🏥 Medical History</h4>
            <p style={{fontSize:'0.875rem',color:'var(--text-secondary)',lineHeight:1.7}}>{patient.medical_history||'No medical history recorded'}</p>
          </div>
          <div className="card">
            <h4 style={{marginBottom:14}}>💊 Current Medications</h4>
            <p style={{fontSize:'0.875rem',color:'var(--text-secondary)'}}>{patient.current_medications||'None'}</p>
          </div>
          {patient.insurance_provider && (
            <div className="card">
              <h4 style={{marginBottom:14}}>🛡 Insurance</h4>
              <div style={{fontSize:'0.875rem'}}><strong>{patient.insurance_provider}</strong></div>
              <div style={{fontSize:'0.8rem',color:'var(--text-muted)'}}>{patient.insurance_number}</div>
            </div>
          )}
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {/* Recent Prescriptions */}
          <div className="card" style={{padding:0}}>
            <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border-color)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontWeight:700,fontSize:'0.9rem'}}>📋 Prescriptions</div>
              <span className="badge badge-primary">{(patient.prescriptions||[]).length}</span>
            </div>
            {(patient.prescriptions||[]).length === 0 ? (
              <div style={{padding:20,textAlign:'center',color:'var(--text-muted)',fontSize:'0.85rem'}}>No prescriptions yet</div>
            ) : (patient.prescriptions||[]).map(rx => (
              <div key={rx.id} style={{padding:'12px 20px',borderBottom:'1px solid var(--border-color)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:'0.82rem',fontFamily:'var(--font-mono)',color:'var(--color-accent)'}}>{rx.prescription_number}</div>
                    <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>Dr. {rx.doctor_name}</div>
                  </div>
                  <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{new Date(rx.prescription_date).toLocaleDateString('en-IN')}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Purchase History */}
          <div className="card" style={{padding:0}}>
            <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border-color)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontWeight:700,fontSize:'0.9rem'}}>🧾 Purchase History</div>
              <span className="badge badge-success">{(patient.purchase_history||[]).length}</span>
            </div>
            {(patient.purchase_history||[]).length === 0 ? (
              <div style={{padding:20,textAlign:'center',color:'var(--text-muted)',fontSize:'0.85rem'}}>No purchases yet</div>
            ) : (patient.purchase_history||[]).map(s => (
              <div key={s.invoice_number} style={{padding:'12px 20px',borderBottom:'1px solid var(--border-color)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontWeight:600,fontSize:'0.82rem',fontFamily:'var(--font-mono)',color:'var(--color-accent)'}}>{s.invoice_number}</div>
                  <div style={{fontSize:'0.75rem',color:'var(--text-muted)',textTransform:'capitalize'}}>{s.payment_method}</div>
                </div>
                <div style={{fontWeight:700,color:'var(--color-secondary)'}}>₹{parseFloat(s.total_amount).toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default PatientDetail
