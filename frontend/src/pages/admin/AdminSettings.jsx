import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const AdminSettings = () => {
  const navigate = useNavigate()
  const ADMIN = import.meta.env.VITE_ADMIN_ROUTE || '/super-admin'
  const [settings, setSettings] = useState({})
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    api.get('/settings').then(r => setSettings(r.data.data || {})).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/settings', settings)
      toast.success('Settings saved successfully!')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }))

  const Section = ({ title, children }) => (
    <div className="card" style={{ marginBottom:20 }}>
      <h4 style={{ marginBottom:20, paddingBottom:12, borderBottom:'1px solid var(--border-color)' }}>{title}</h4>
      <div className="grid-2" style={{ gap:16 }}>{children}</div>
    </div>
  )

  const Field = ({ k, label, type='text', placeholder }) => (
    <div className="form-group" style={{ marginBottom:0 }}>
      <label className="form-label">{label}</label>
      <input type={type} className="form-control" value={settings[k] || ''} onChange={e => set(k, e.target.value)} placeholder={placeholder} />
    </div>
  )

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:300}}><div className="spinner" style={{width:40,height:40,borderWidth:3}}/></div>

  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} style={{ minHeight:'100vh', background:'var(--bg-base)', padding:32 }}>
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={()=>navigate(ADMIN)} style={{marginBottom:8}}><ArrowLeft size={16}/> Admin Home</button>
          <h2 className="page-title">System Settings</h2>
          <p className="page-subtitle">Configure global application settings</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="save-settings-btn">
            {saving ? <><Loader2 size={16} style={{animation:'spin 0.7s linear infinite'}}/> Saving…</> : <><Save size={16}/> Save All Settings</>}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <Section title="🏥 Hospital / Clinic Information">
          <Field k="hospital_name"    label="Hospital Name"     placeholder="MediStock Pro Hospital" />
          <Field k="hospital_email"   label="Hospital Email"    type="email" placeholder="info@hospital.com" />
          <Field k="hospital_phone"   label="Hospital Phone"    type="tel" />
          <Field k="hospital_address" label="Hospital Address" />
          <Field k="hospital_city"    label="City" />
          <Field k="hospital_state"   label="State" />
          <Field k="hospital_gstin"   label="GSTIN" placeholder="22AAAAA0000A1Z5" />
          <Field k="hospital_license" label="License Number" />
        </Section>

        <Section title="💰 Currency & Financial">
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Currency Symbol</label>
            <select className="form-control" value={settings.currency || '₹'} onChange={e => set('currency', e.target.value)}>
              <option value="₹">₹ INR (Indian Rupee)</option>
              <option value="$">$ USD</option>
              <option value="£">£ GBP</option>
              <option value="€">€ EUR</option>
            </select>
          </div>
          <Field k="tax_rate"    label="Default Tax Rate (%)" type="number" placeholder="18" />
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Financial Year Start</label>
            <select className="form-control" value={settings.fy_start || 'April'} onChange={e => set('fy_start', e.target.value)}>
              {['January','April','July','October'].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </Section>

        <Section title="📧 Email / SMTP Configuration">
          <Field k="smtp_host"     label="SMTP Host"     placeholder="smtp.gmail.com" />
          <Field k="smtp_port"     label="SMTP Port"     type="number" placeholder="587" />
          <Field k="smtp_user"     label="SMTP Username" type="email" />
          <Field k="smtp_from"     label="From Name"     placeholder="MediStock Pro" />
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">SMTP Encryption</label>
            <select className="form-control" value={settings.smtp_secure || 'TLS'} onChange={e => set('smtp_secure', e.target.value)}>
              <option value="TLS">TLS</option>
              <option value="SSL">SSL</option>
              <option value="None">None</option>
            </select>
          </div>
        </Section>

        <Section title="🔔 Notification Thresholds">
          <Field k="low_stock_threshold"       label="Low Stock Alert (units)" type="number" placeholder="10" />
          <Field k="expiry_alert_days"         label="Expiry Alert (days)"     type="number" placeholder="30" />
          <Field k="near_expiry_warning_days"  label="Near Expiry Warning (days)" type="number" placeholder="90" />
        </Section>
      </form>
    </motion.div>
  )
}

export default AdminSettings
