import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Edit2, Trash2, Shield, Search, User } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

const EMPTY = { full_name:'', username:'', email:'', phone:'', role_id:'', password:'' }

const AdminUsers = () => {
  const navigate = useNavigate()
  const ADMIN = import.meta.env.VITE_ADMIN_ROUTE || '/super-admin'
  const [users, setUsers]   = useState([])
  const [roles, setRoles]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem]   = useState(null)
  const [form, setForm]           = useState(EMPTY)
  const [saving, setSaving]       = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [uRes, rRes] = await Promise.all([api.get('/admin/users'), api.get('/admin/roles')])
      setUsers(uRes.data.data); setRoles(rRes.data.data)
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openModal = (item=null) => {
    setEditItem(item)
    setForm(item ? { full_name:item.full_name||'', username:item.username||'', email:item.email||'', phone:item.phone||'', role_id:item.role_id||'', password:'' } : EMPTY)
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.full_name||!form.email||!form.role_id) return toast.error('Fill all required fields')
    if (!editItem && !form.password) return toast.error('Password required for new users')
    setSaving(true)
    try {
      if (editItem) { await api.put(`/admin/users/${editItem.id}`, form); toast.success('User updated') }
      else          { await api.post('/admin/users', form);              toast.success('User created') }
      setShowModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message||'Failed') }
    finally { setSaving(false) }
  }

  const handleSuspend = async (u) => {
    const r = await Swal.fire({ title:`Suspend ${u.full_name}?`, icon:'warning', showCancelButton:true, confirmButtonText:'Suspend', confirmButtonColor:'#EF4444', background:'#1E293B', color:'#F8FAFC' })
    if (!r.isConfirmed) return
    try { await api.patch(`/admin/users/${u.id}/suspend`); toast.success('User suspended'); load() }
    catch { toast.error('Failed') }
  }

  const handleResetPwd = async (u) => {
    const { value: pwd } = await Swal.fire({ title:'Reset Password', input:'password', inputPlaceholder:'New password', showCancelButton:true, background:'#1E293B', color:'#F8FAFC' })
    if (!pwd) return
    try { await api.patch(`/admin/users/${u.id}/reset-password`, { new_password: pwd }); toast.success('Password reset') }
    catch { toast.error('Failed') }
  }

  const filtered = users.filter(u => !search || u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)', padding:32 }}>
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={()=>navigate(ADMIN)} style={{marginBottom:8}}><ArrowLeft size={16}/> Admin Home</button>
          <h2 className="page-title">User Management</h2>
          <p className="page-subtitle">{users.length} accounts</p>
        </div>
        <div className="page-actions">
          <div style={{position:'relative'}}>
            <Search size={16} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)'}}/>
            <input className="form-control" style={{paddingLeft:34,width:240}} placeholder="Search users…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <button className="btn btn-primary btn-sm" onClick={()=>openModal()} id="add-user-btn"><Plus size={14}/> Add User</button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Last Login</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? Array(6).fill(0).map((_,i)=><tr key={i}>{Array(5).fill(0).map((__,j)=><td key={j}><div className="skeleton" style={{height:16,borderRadius:4}}/></td>)}</tr>) :
             filtered.map(u => (
              <motion.tr key={u.id} initial={{opacity:0}} animate={{opacity:1}}>
                <td>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,var(--color-secondary),var(--color-accent))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.8rem',fontWeight:700,color:'#fff',flexShrink:0}}>
                      {u.full_name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
                    </div>
                    <div>
                      <div style={{fontWeight:600,fontSize:'0.875rem'}}>{u.full_name}</div>
                      <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-primary" style={{fontSize:'0.65rem'}}>{u.role_display||u.role_name}</span></td>
                <td><span className={`badge ${u.status==='active'?'badge-success':u.status==='suspended'?'badge-danger':'badge-neutral'}`}>{u.status}</span></td>
                <td style={{color:'var(--text-muted)',fontSize:'0.78rem'}}>{u.last_login ? new Date(u.last_login).toLocaleString('en-IN') : 'Never'}</td>
                <td>
                  <div style={{display:'flex',gap:6}}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={()=>openModal(u)} data-tooltip="Edit" id={`edit-user-${u.id}`}><Edit2 size={13}/></button>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={()=>handleResetPwd(u)} data-tooltip="Reset Password" id={`reset-pwd-${u.id}`}><Shield size={13}/></button>
                    {u.status==='active' && <button className="btn btn-ghost btn-icon btn-sm" style={{color:'var(--color-danger)'}} onClick={()=>handleSuspend(u)} id={`suspend-user-${u.id}`}><Trash2 size={13}/></button>}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <motion.div className="modal" initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}}>
            <div className="modal-header"><h3 className="modal-title">{editItem?'Edit User':'Add User'}</h3><button className="btn btn-ghost btn-icon" onClick={()=>setShowModal(false)}>✕</button></div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="grid-2" style={{gap:14}}>
                  {[['full_name','Full Name *','text'],['username','Username *','text'],['email','Email *','email'],['phone','Phone','tel']].map(([k,l,t])=>(
                    <div key={k} className="form-group" style={{marginBottom:0}}><label className="form-label">{l}</label><input type={t} className="form-control" value={form[k]||''} onChange={e=>set(k,e.target.value)}/></div>
                  ))}
                  <div className="form-group" style={{marginBottom:0}}>
                    <label className="form-label">Role *</label>
                    <select className="form-control" value={form.role_id} onChange={e=>set('role_id',e.target.value)}>
                      <option value="">Select Role</option>
                      {roles.map(r=><option key={r.id} value={r.id}>{r.display_name}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{marginBottom:0}}>
                    <label className="form-label">{editItem ? 'New Password (optional)' : 'Password *'}</label>
                    <input type="password" className="form-control" value={form.password||''} onChange={e=>set('password',e.target.value)} placeholder={editItem?'Leave blank to keep current':'Min 6 characters'}/>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={()=>setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving} id="save-user-btn">{saving?'Saving…':editItem?'Update':'Create User'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers
