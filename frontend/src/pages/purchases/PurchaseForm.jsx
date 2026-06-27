import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Trash2, Save, Loader2, Search } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const PurchaseForm = () => {
  const navigate = useNavigate()
  const [suppliers, setSuppliers] = useState([])
  const [form, setForm]           = useState({ supplier_id:'', purchase_date: new Date().toISOString().split('T')[0], invoice_number:'', payment_method:'cash', notes:'' })
  const [items, setItems]         = useState([{ medicine_id:'', medicine_name:'', batch_number:'', expiry_date:'', quantity:1, unit_price:'', gst_percentage:5 }])
  const [medSearch, setMedSearch] = useState({})
  const [medResults, setMedResults] = useState({})
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
    api.get('/suppliers?status=active&limit=100').then(r => setSuppliers(r.data.data)).catch(() => {})
  }, [])

  const searchMed = async (idx, q) => {
    setMedSearch(s => ({ ...s, [idx]: q }))
    if (q.length < 2) { setMedResults(r => ({ ...r, [idx]: [] })); return }
    try {
      const { data } = await api.get('/medicines/search', { params: { q } })
      setMedResults(r => ({ ...r, [idx]: data.data }))
    } catch {}
  }

  const selectMed = (idx, med) => {
    setItems(its => its.map((it, i) => i === idx ? {
      ...it, medicine_id: med.id, medicine_name: med.name,
      unit_price: med.selling_price, gst_percentage: med.gst_percentage,
      expiry_date: med.expiry_date ? med.expiry_date.split('T')[0] : ''
    } : it))
    setMedSearch(s => ({ ...s, [idx]: med.name }))
    setMedResults(r => ({ ...r, [idx]: [] }))
  }

  const addItem = () => setItems(its => [...its, { medicine_id:'',medicine_name:'',batch_number:'',expiry_date:'',quantity:1,unit_price:'',gst_percentage:5 }])
  const removeItem = (idx) => setItems(its => its.filter((_,i) => i!==idx))
  const setItem = (idx, k, v) => setItems(its => its.map((it,i) => i===idx ? {...it,[k]:v} : it))
  const set = (k,v) => setForm(f => ({...f,[k]:v}))

  const totals = items.reduce((acc, it) => {
    const sub  = (parseFloat(it.unit_price)||0) * (parseInt(it.quantity)||0)
    const tax  = sub * (parseFloat(it.gst_percentage)||0) / 100
    return { subtotal: acc.subtotal + sub, tax: acc.tax + tax }
  }, { subtotal:0, tax:0 })
  const grand = totals.subtotal + totals.tax

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.supplier_id) return toast.error('Select a supplier')
    if (items.some(it => !it.medicine_id || !it.unit_price || !it.quantity)) return toast.error('Fill all item details')
    setSaving(true)
    try {
      const { data } = await api.post('/purchases', { ...form, items })
      toast.success(`Purchase Order ${data.data.purchase_number} created!`)
      navigate('/purchases')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create PO') }
    finally { setSaving(false) }
  }

  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }}>
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/purchases')} style={{ marginBottom:8 }}><ArrowLeft size={16}/> Back</button>
          <h2 className="page-title">New Purchase Order</h2>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={() => navigate('/purchases')}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <><Loader2 size={16} style={{animation:'spin 0.7s linear infinite'}}/> Creating…</> : <><Save size={16}/> Create PO</>}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom:20 }}>
          <h4 style={{ marginBottom:16, paddingBottom:12, borderBottom:'1px solid var(--border-color)' }}>📋 Order Details</h4>
          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Supplier *</label>
              <select className="form-control" value={form.supplier_id} onChange={e => set('supplier_id',e.target.value)}>
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Purchase Date</label>
              <input type="date" className="form-control" value={form.purchase_date} onChange={e => set('purchase_date',e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Invoice Number</label>
              <input type="text" className="form-control" placeholder="Supplier invoice #" value={form.invoice_number} onChange={e => set('invoice_number',e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select className="form-control" value={form.payment_method} onChange={e => set('payment_method',e.target.value)}>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="upi">UPI</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn:'span 2' }}>
              <label className="form-label">Notes</label>
              <input type="text" className="form-control" placeholder="Optional notes…" value={form.notes} onChange={e => set('notes',e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom:20 }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,paddingBottom:12,borderBottom:'1px solid var(--border-color)' }}>
            <h4>💊 Medicine Items</h4>
            <button type="button" className="btn btn-outline btn-sm" onClick={addItem}><Plus size={14}/> Add Item</button>
          </div>

          {items.map((item, idx) => (
            <div key={idx} style={{ background:'var(--bg-surface-2)', borderRadius:'var(--radius-md)', padding:16, marginBottom:12, position:'relative' }}>
              <div className="grid-4" style={{ gap:12, alignItems:'end' }}>
                {/* Medicine Search */}
                <div className="form-group" style={{ marginBottom:0, position:'relative' }}>
                  <label className="form-label">Medicine *</label>
                  <div style={{ position:'relative' }}>
                    <Search size={14} style={{ position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)' }} />
                    <input type="text" className="form-control" style={{ paddingLeft:32 }}
                      placeholder="Search medicine…"
                      value={medSearch[idx] || item.medicine_name}
                      onChange={e => searchMed(idx, e.target.value)} />
                  </div>
                  {(medResults[idx]||[]).length > 0 && (
                    <div style={{ position:'absolute',zIndex:100,width:'100%',background:'var(--bg-surface)',border:'1px solid var(--border-color)',borderRadius:'var(--radius-md)',boxShadow:'var(--shadow-lg)',marginTop:4 }}>
                      {medResults[idx].map(m => (
                        <div key={m.id} onClick={() => selectMed(idx,m)} style={{ padding:'9px 12px',cursor:'pointer',fontSize:'0.85rem' }}
                          className="dropdown-item">
                          <div style={{ fontWeight:600 }}>{m.name}</div>
                          <div style={{ fontSize:'0.75rem',color:'var(--text-muted)' }}>₹{m.selling_price} | Stock: {m.quantity}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">Batch #</label>
                  <input type="text" className="form-control" placeholder="Batch" value={item.batch_number} onChange={e => setItem(idx,'batch_number',e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">Expiry</label>
                  <input type="date" className="form-control" value={item.expiry_date} onChange={e => setItem(idx,'expiry_date',e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">Qty *</label>
                  <input type="number" min="1" className="form-control" value={item.quantity} onChange={e => setItem(idx,'quantity',e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">Unit Price (₹) *</label>
                  <input type="number" step="0.01" min="0" className="form-control" value={item.unit_price} onChange={e => setItem(idx,'unit_price',e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">GST %</label>
                  <select className="form-control" value={item.gst_percentage} onChange={e => setItem(idx,'gst_percentage',e.target.value)}>
                    {[0,5,12,18,28].map(g => <option key={g} value={g}>{g}%</option>)}
                  </select>
                </div>
                <div style={{ display:'flex',alignItems:'flex-end',paddingBottom:4 }}>
                  <div style={{ fontWeight:700, color:'var(--color-secondary)', fontSize:'0.9rem' }}>
                    ₹{((parseFloat(item.unit_price)||0)*(parseInt(item.quantity)||0)*(1+(parseFloat(item.gst_percentage)||0)/100)).toFixed(2)}
                  </div>
                </div>
                {items.length > 1 && (
                  <button type="button" className="btn btn-ghost btn-icon" style={{ alignSelf:'flex-end',color:'var(--color-danger)' }} onClick={() => removeItem(idx)}>
                    <Trash2 size={15}/>
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Totals */}
          <div style={{ display:'flex',justifyContent:'flex-end',marginTop:8 }}>
            <div style={{ background:'var(--bg-surface-2)',borderRadius:'var(--radius-md)',padding:'16px 24px',minWidth:240 }}>
              {[['Subtotal','₹'+totals.subtotal.toFixed(2)],['GST','₹'+totals.tax.toFixed(2)]].map(([l,v]) => (
                <div key={l} style={{ display:'flex',justifyContent:'space-between',marginBottom:8,fontSize:'0.85rem',color:'var(--text-muted)' }}>
                  <span>{l}</span><span>{v}</span>
                </div>
              ))}
              <div style={{ display:'flex',justifyContent:'space-between',fontSize:'1rem',fontWeight:800,color:'var(--color-secondary)',borderTop:'1px solid var(--border-color)',paddingTop:8 }}>
                <span>Total</span><span>₹{grand.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  )
}

export default PurchaseForm
