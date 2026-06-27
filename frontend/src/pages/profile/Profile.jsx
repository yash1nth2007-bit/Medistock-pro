import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Shield, Lock, Eye, EyeOff, Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const guestUser = {
  full_name: 'Guest User',
  email: 'guest@medistockpro.com',
  username: 'guest',
  role_display: 'Guest',
  role_name: 'guest',
  last_login: null,
  status: 'Active'
}

const Profile = () => {
  const [tab, setTab]       = useState('profile')
  const [showPass, setShowPass] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ full_name:'Guest User', phone:'0000000000' })
  const [pass, setPass] = useState({ current_password:'', new_password:'', confirm_password:'' })

  const initials = 'G'

  const handleProfileSave = async (e) => {
    e.preventDefault()
    toast.success('Profile feature is disabled in this build.')
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    toast.success('Password feature is disabled in this build.')
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setP = (k, v) => setPass(p => ({ ...p, [k]: v }))

  const InfoItem = ({ label, value }) => (
    <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border-color)', fontSize:'0.875rem' }}>
      <span style={{ color:'var(--text-muted)', fontWeight:500 }}>{label}</span>
      <span style={{ color:'var(--text-primary)', fontWeight:600 }}>{value || '—'}</span>
    </div>
  )

  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">My Profile</h2>
          <p className="page-subtitle">Manage your account settings</p>
        </div>
      </div>

      <div className="grid-3" style={{ alignItems:'start', gap:24 }}>
        {/* Avatar card */}
        <div className="card" style={{ textAlign:'center' }}>
          <div style={{ width:88, height:88, borderRadius:'50%', background:'linear-gradient(135deg,var(--color-secondary),var(--color-accent))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', fontWeight:800, color:'#fff', margin:'0 auto 16px', boxShadow:'var(--shadow-glow)' }}>
            {initials}
          </div>
          <h3 style={{ marginBottom:4 }}>{guestUser.full_name}</h3>
          <div style={{ marginBottom:12 }}><span className="badge badge-primary">{guestUser.role_display}</span></div>
          <p style={{ fontSize:'0.8rem' }}>{guestUser.email}</p>
          <div className="divider" />
          <div style={{ display:'flex', flexDirection:'column', gap:8, fontSize:'0.8rem', color:'var(--text-muted)', textAlign:'left' }}>
            <InfoItem label="Username"   value={`@${guestUser.username}`} />
            <InfoItem label="Last Login"  value="N/A" />
            <InfoItem label="Status"      value={guestUser.status} />
          </div>
        </div>

        {/* Edit forms */}
        <div style={{ gridColumn:'span 2', display:'flex', flexDirection:'column', gap:24 }}>
          {/* Tabs */}
          <div className="tabs">
            <button className={`tab-btn ${tab==='profile'?'active':''}`} onClick={()=>setTab('profile')}><User size={14} style={{marginRight:6}}/>Profile</button>
            <button className={`tab-btn ${tab==='password'?'active':''}`} onClick={()=>setTab('password')}><Lock size={14} style={{marginRight:6}}/>Security</button>
          </div>

          {tab === 'profile' && (
            <div className="card">
              <h4 style={{ marginBottom:20, paddingBottom:12, borderBottom:'1px solid var(--border-color)' }}>👤 Personal Information</h4>
              <form onSubmit={handleProfileSave}>
                <div className="grid-2" style={{ gap:16 }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="full_name">Full Name</label>
                    <input id="full_name" type="text" className="form-control" value={form.full_name} onChange={e=>set('full_name',e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">Phone</label>
                    <input id="phone" type="tel" className="form-control" value={form.phone} onChange={e=>set('phone',e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={guestUser.email} disabled style={{ opacity:0.6 }} />
                  <div className="form-hint">Email cannot be changed. Contact admin.</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input type="text" className="form-control" value={guestUser.username} disabled style={{ opacity:0.6 }} />
                </div>
                <div style={{ display:'flex', justifyContent:'flex-end' }}>
                  <button type="submit" className="btn btn-primary" disabled={saving} id="save-profile-btn">
                    {saving ? <><Loader2 size={16} style={{animation:'spin 0.7s linear infinite'}}/> Saving…</> : <><Save size={16}/> Save Changes</>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {tab === 'password' && (
            <div className="card">
              <h4 style={{ marginBottom:20, paddingBottom:12, borderBottom:'1px solid var(--border-color)' }}>🔐 Change Password</h4>
              <div className="alert alert-info" style={{ marginBottom:20 }}>
                <Shield size={16}/> Use a strong password with at least 8 characters, including uppercase, numbers, and symbols.
              </div>
              <form onSubmit={handlePasswordChange}>
                {[
                  ['current_password', 'Current Password'],
                  ['new_password',     'New Password'],
                  ['confirm_password', 'Confirm New Password'],
                ].map(([k, l]) => (
                  <div key={k} className="form-group">
                    <label className="form-label" htmlFor={k}>{l}</label>
                    <div style={{ position:'relative' }}>
                      <Lock size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', pointerEvents:'none' }} />
                      <input id={k} type={showPass ? 'text' : 'password'} className="form-control"
                        style={{ paddingLeft:38, paddingRight:40 }}
                        value={pass[k]} onChange={e => setP(k, e.target.value)} />
                      <button type="button" onClick={()=>setShowPass(s=>!s)}
                        style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}>
                        {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    </div>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'flex-end' }}>
                  <button type="submit" className="btn btn-primary" disabled={saving} id="change-password-btn">
                    {saving ? <><Loader2 size={16} style={{animation:'spin 0.7s linear infinite'}}/> Updating…</> : <><Lock size={16}/> Change Password</>}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default Profile
