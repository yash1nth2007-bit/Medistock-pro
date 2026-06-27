import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const EMPTY = {
  name:'', generic_name:'', brand_name:'', manufacturer:'', category_id:'', batch_number:'',
  manufacturing_date:'', expiry_date:'', purchase_price:'', selling_price:'', gst_percentage:'5',
  quantity:'0', reorder_level:'10', storage_conditions:'', description:'', unit:'tablets',
  barcode:'', status:'active'
}

const MedicineForm = () => {
  const { id } = useParams()
  const isEdit  = !!id
  const navigate = useNavigate()
  const [form, setForm]         = useState(EMPTY)
  const [categories, setCategories] = useState([])
  const [loading, setLoading]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [errors, setErrors]     = useState({})

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const [catsRes] = await Promise.all([api.get('/categories')])
        setCategories(catsRes.data.data)
        if (isEdit) {
          const { data } = await api.get(`/medicines/${id}`)
          const m = data.data
          setForm({
            name: m.name||'', generic_name: m.generic_name||'', brand_name: m.brand_name||'',
            manufacturer: m.manufacturer||'', category_id: m.category_id||'', batch_number: m.batch_number||'',
            manufacturing_date: m.manufacturing_date ? m.manufacturing_date.split('T')[0] : '',
            expiry_date: m.expiry_date ? m.expiry_date.split('T')[0] : '',
            purchase_price: m.purchase_price||'', selling_price: m.selling_price||'',
            gst_percentage: m.gst_percentage||'5', quantity: m.quantity||'0',
            reorder_level: m.reorder_level||'10', storage_conditions: m.storage_conditions||'',
            description: m.description||'', unit: m.unit||'tablets',
            barcode: m.barcode||'', status: m.status||'active'
          })
        }
      } catch { toast.error('Failed to load data') }
      finally { setLoading(false) }
    }
    init()
  }, [id])

  const validate = () => {
    const e = {}
    if (!form.name) e.name = 'Name is required'
    if (!form.expiry_date) e.expiry_date = 'Expiry date is required'
    if (!form.selling_price || parseFloat(form.selling_price) <= 0) e.selling_price = 'Selling price required'
    if (!form.purchase_price || parseFloat(form.purchase_price) <= 0) e.purchase_price = 'Purchase price required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) { toast.error('Please fix validation errors'); return }
    setSaving(true)
    try {
      const payload = { ...form, category_id: form.category_id || null }
      if (isEdit) {
        await api.put(`/medicines/${id}`, payload)
        toast.success('Medicine updated successfully!')
      } else {
        await api.post('/medicines', payload)
        toast.success('Medicine added successfully!')
      }
      navigate('/medicines')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const Input = ({ id, label, type='text', required, placeholder, half }) => (
    <div className="form-group" style={half ? {} : {}}>
      <label className="form-label" htmlFor={id}>{label}{required && <span style={{ color:'var(--color-danger)',marginLeft:2 }}>*</span>}</label>
      <input
        id={id} type={type}
        className={`form-control ${errors[id] ? 'error' : ''}`}
        placeholder={placeholder}
        value={form[id]} onChange={e => set(id, e.target.value)}
      />
      {errors[id] && <div className="form-error">⚠ {errors[id]}</div>}
    </div>
  )

  if (loading) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:300 }}>
      <div className="spinner" style={{ width:40,height:40,borderWidth:3 }} />
    </div>
  )

  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }}>
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/medicines')} style={{ marginBottom:8 }}>
            <ArrowLeft size={16}/> Back
          </button>
          <h2 className="page-title">{isEdit ? 'Edit Medicine' : 'Add New Medicine'}</h2>
          <p className="page-subtitle">Fill in the details for the medicine</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={() => navigate('/medicines')}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving} id="save-medicine-btn">
            {saving ? <><Loader2 size={16} style={{animation:'spin 0.7s linear infinite'}}/> Saving…</> : <><Save size={16}/> {isEdit ? 'Update' : 'Save'}</>}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid-2" style={{ gap:24 }}>
          {/* Basic Info */}
          <div className="card" style={{ gridColumn:'span 2' }}>
            <h4 style={{ marginBottom:20, paddingBottom:12, borderBottom:'1px solid var(--border-color)' }}>📋 Basic Information</h4>
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label" htmlFor="name">Medicine Name <span style={{ color:'var(--color-danger)' }}>*</span></label>
                <input id="name" type="text" className={`form-control ${errors.name?'error':''}`} placeholder="e.g. Paracetamol 500mg" value={form.name} onChange={e => set('name',e.target.value)} />
                {errors.name && <div className="form-error">⚠ {errors.name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="generic_name">Generic Name</label>
                <input id="generic_name" type="text" className="form-control" placeholder="e.g. Paracetamol" value={form.generic_name} onChange={e => set('generic_name',e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="brand_name">Brand Name</label>
                <input id="brand_name" type="text" className="form-control" placeholder="e.g. Dolo 500" value={form.brand_name} onChange={e => set('brand_name',e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="manufacturer">Manufacturer</label>
                <input id="manufacturer" type="text" className="form-control" placeholder="e.g. Cipla Ltd" value={form.manufacturer} onChange={e => set('manufacturer',e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="category_id">Category</label>
                <select id="category_id" className="form-control" value={form.category_id} onChange={e => set('category_id',e.target.value)}>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="barcode">Barcode</label>
                <input id="barcode" type="text" className="form-control" placeholder="e.g. 8901234567890" value={form.barcode} onChange={e => set('barcode',e.target.value)} />
              </div>
            </div>
          </div>

          {/* Batch & Dates */}
          <div className="card">
            <h4 style={{ marginBottom:20, paddingBottom:12, borderBottom:'1px solid var(--border-color)' }}>📦 Batch & Dates</h4>
            <div className="form-group">
              <label className="form-label" htmlFor="batch_number">Batch Number</label>
              <input id="batch_number" type="text" className="form-control" placeholder="e.g. BATCH-2024-001" value={form.batch_number} onChange={e => set('batch_number',e.target.value)} />
            </div>
            <div className="grid-2" style={{ gap:16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="manufacturing_date">Mfg. Date</label>
                <input id="manufacturing_date" type="date" className="form-control" value={form.manufacturing_date} onChange={e => set('manufacturing_date',e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="expiry_date">Expiry Date <span style={{ color:'var(--color-danger)' }}>*</span></label>
                <input id="expiry_date" type="date" className={`form-control ${errors.expiry_date?'error':''}`} value={form.expiry_date} onChange={e => set('expiry_date',e.target.value)} />
                {errors.expiry_date && <div className="form-error">⚠ {errors.expiry_date}</div>}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="card">
            <h4 style={{ marginBottom:20, paddingBottom:12, borderBottom:'1px solid var(--border-color)' }}>💰 Pricing & GST</h4>
            <div className="grid-2" style={{ gap:16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="purchase_price">Purchase Price (₹) <span style={{ color:'var(--color-danger)' }}>*</span></label>
                <input id="purchase_price" type="number" step="0.01" min="0" className={`form-control ${errors.purchase_price?'error':''}`} placeholder="0.00" value={form.purchase_price} onChange={e => set('purchase_price',e.target.value)} />
                {errors.purchase_price && <div className="form-error">⚠ {errors.purchase_price}</div>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="selling_price">Selling Price (₹) <span style={{ color:'var(--color-danger)' }}>*</span></label>
                <input id="selling_price" type="number" step="0.01" min="0" className={`form-control ${errors.selling_price?'error':''}`} placeholder="0.00" value={form.selling_price} onChange={e => set('selling_price',e.target.value)} />
                {errors.selling_price && <div className="form-error">⚠ {errors.selling_price}</div>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="gst_percentage">GST (%)</label>
                <select id="gst_percentage" className="form-control" value={form.gst_percentage} onChange={e => set('gst_percentage',e.target.value)}>
                  <option value="0">0% (Exempt)</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="unit">Unit</label>
                <select id="unit" className="form-control" value={form.unit} onChange={e => set('unit',e.target.value)}>
                  {['tablets','capsules','strips','bottles','vials','sachets','inhalers','injections','ml','mg','units'].map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stock */}
          <div className="card">
            <h4 style={{ marginBottom:20, paddingBottom:12, borderBottom:'1px solid var(--border-color)' }}>📊 Stock Management</h4>
            <div className="grid-2" style={{ gap:16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="quantity">Current Quantity</label>
                <input id="quantity" type="number" min="0" className="form-control" value={form.quantity} onChange={e => set('quantity',e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reorder_level">Reorder Level</label>
                <input id="reorder_level" type="number" min="0" className="form-control" value={form.reorder_level} onChange={e => set('reorder_level',e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="storage_conditions">Storage Conditions</label>
              <input id="storage_conditions" type="text" className="form-control" placeholder="e.g. Store below 25°C, away from light" value={form.storage_conditions} onChange={e => set('storage_conditions',e.target.value)} />
            </div>
            {isEdit && (
              <div className="form-group">
                <label className="form-label" htmlFor="status">Status</label>
                <select id="status" className="form-control" value={form.status} onChange={e => set('status',e.target.value)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="card" style={{ gridColumn:'span 2' }}>
            <h4 style={{ marginBottom:16, paddingBottom:12, borderBottom:'1px solid var(--border-color)' }}>📝 Description</h4>
            <div className="form-group" style={{ marginBottom:0 }}>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Optional: Add medicine description, uses, side effects, warnings…"
                value={form.description}
                onChange={e => set('description',e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Mobile save button */}
        <div style={{ marginTop:20, display:'flex', justifyContent:'flex-end', gap:12 }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/medicines')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><Loader2 size={16} style={{animation:'spin 0.7s linear infinite'}}/> Saving…</> : <><Save size={16}/> {isEdit ? 'Update Medicine' : 'Save Medicine'}</>}
          </button>
        </div>
      </form>
    </motion.div>
  )
}

export default MedicineForm
