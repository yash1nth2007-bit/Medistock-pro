import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Plus, Trash2, ShoppingCart, Printer, Check, ArrowLeft, User } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

const POSBilling = () => {
  const navigate = useNavigate()
  const [cart, setCart]           = useState([])
  const [search, setSearch]       = useState('')
  const [results, setResults]     = useState([])
  const [searchFocus, setSearchFocus] = useState(false)
  const [patientSearch, setPatientSearch] = useState('')
  const [patientResults, setPatientResults] = useState([])
  const [patient, setPatient]     = useState(null)
  const [discount, setDiscount]   = useState(0)
  const [payMethod, setPayMethod] = useState('cash')
  const [paidAmt, setPaidAmt]     = useState('')
  const [processing, setProcessing] = useState(false)
  const [invoice, setInvoice]     = useState(null)
  const searchRef = useRef()

  // Medicine search
  useEffect(() => {
    if (search.length < 2) { setResults([]); return }
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get('/medicines/search', { params: { q: search } })
        setResults(data.data)
      } catch {}
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  // Patient search
  useEffect(() => {
    if (patientSearch.length < 2) { setPatientResults([]); return }
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get('/patients', { params: { search: patientSearch, limit:5 } })
        setPatientResults(data.data)
      } catch {}
    }, 300)
    return () => clearTimeout(t)
  }, [patientSearch])

  const addToCart = (med) => {
    setCart(c => {
      const existing = c.find(i => i.medicine_id === med.id)
      if (existing) return c.map(i => i.medicine_id === med.id ? { ...i, quantity: Math.min(i.quantity + 1, med.quantity) } : i)
      return [...c, { medicine_id: med.id, name: med.name, unit_price: parseFloat(med.selling_price), gst_percentage: parseFloat(med.gst_percentage||0), quantity: 1, max: med.quantity, unit: med.unit, discount_percentage: 0 }]
    })
    setSearch('')
    setResults([])
    searchRef.current?.focus()
  }

  const updateQty = (idx, qty) => {
    const item = cart[idx]
    if (qty < 1 || qty > item.max) return
    setCart(c => c.map((it,i) => i===idx ? {...it,quantity:qty} : it))
  }
  const removeItem = (idx) => setCart(c => c.filter((_,i) => i!==idx))

  const subtotal  = cart.reduce((a,it) => a + it.unit_price * it.quantity, 0)
  const discAmt   = subtotal * discount / 100
  const taxAmt    = cart.reduce((a,it) => a + it.unit_price * it.quantity * it.gst_percentage / 100, 0)
  const total     = subtotal - discAmt + taxAmt
  const change    = Math.max(0, (parseFloat(paidAmt) || total) - total)

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error('Cart is empty')
    const paid = parseFloat(paidAmt) || total
    if (paid < total) return toast.error('Insufficient payment amount')
    setProcessing(true)
    try {
      const payload = {
        patient_id: patient?.id || null,
        items: cart.map(it => ({ medicine_id: it.medicine_id, quantity: it.quantity, unit_price: it.unit_price, gst_percentage: it.gst_percentage, discount_percentage: it.discount_percentage })),
        discount_percentage: discount,
        payment_method: payMethod,
        paid_amount: paid
      }
      const { data } = await api.post('/sales', payload)
      setInvoice({ ...data.data, total_amount: total, items: cart, patient, payment_method: payMethod, paid_amount: paid, change_amount: change })
      toast.success('Sale completed!')
    } catch (err) { toast.error(err.response?.data?.message || 'Checkout failed') }
    finally { setProcessing(false) }
  }

  const resetPOS = () => {
    setCart([]); setSearch(''); setPatient(null); setPatientSearch(''); setDiscount(0); setPaidAmt(''); setInvoice(null)
  }

  // Invoice receipt view
  if (invoice) return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ maxWidth:520, margin:'0 auto' }}>
      <div className="card" id="invoice-receipt">
        <div style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>✅</div>
          <h3 style={{ color:'var(--color-success)', marginBottom:4 }}>Payment Successful!</h3>
          <div className="font-mono" style={{ color:'var(--color-accent)', fontSize:'0.9rem' }}>{invoice.invoice_number}</div>
        </div>
        <div style={{ background:'var(--bg-surface-2)', borderRadius:'var(--radius-md)', padding:16, marginBottom:16 }}>
          {invoice.items.map((it,i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:'0.875rem' }}>
              <span>{it.name} × {it.quantity}</span>
              <span style={{ fontWeight:600 }}>₹{(it.unit_price * it.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ borderTop:'1px solid var(--border-color)', paddingTop:8, marginTop:8 }}>
            {[['Subtotal',`₹${subtotal.toFixed(2)}`],['Discount',`-₹${discAmt.toFixed(2)}`],['GST',`₹${taxAmt.toFixed(2)}`]].map(([l,v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.82rem', color:'var(--text-muted)', marginBottom:4 }}><span>{l}</span><span>{v}</span></div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:'1.1rem', color:'var(--color-secondary)', marginTop:8, borderTop:'1px solid var(--border-color)', paddingTop:8 }}>
              <span>Total</span><span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        {change > 0 && <div className="alert alert-success">💰 Change to return: <strong>₹{change.toFixed(2)}</strong></div>}
        <div style={{ display:'flex', gap:12, marginTop:16 }}>
          <button className="btn btn-outline w-full" onClick={() => window.print()} id="print-receipt-btn"><Printer size={16}/> Print</button>
          <button className="btn btn-primary w-full" onClick={resetPOS} id="new-sale-after-btn"><Plus size={16}/> New Sale</button>
        </div>
        <button className="btn btn-ghost w-full" style={{ marginTop:8 }} onClick={() => navigate('/sales')}>View All Sales</button>
      </div>
    </motion.div>
  )

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:20, height:'calc(100vh - 160px)' }}>
      {/* Left — Product search */}
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/sales')}><ArrowLeft size={16}/></button>
          <h2 style={{ fontWeight:800, fontSize:'1.25rem' }}>POS Billing</h2>
        </div>

        {/* Patient selection */}
        <div style={{ position:'relative' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'var(--bg-surface)', border:'1.5px solid var(--border-color)', borderRadius:'var(--radius-md)' }}>
            <User size={16} style={{ color:'var(--text-muted)' }} />
            {patient ? (
              <div style={{ flex:1 }}>
                <span style={{ fontWeight:600 }}>{patient.full_name}</span>
                <span style={{ color:'var(--text-muted)', marginLeft:8, fontSize:'0.8rem' }}>{patient.phone}</span>
              </div>
            ) : (
              <input type="text" style={{ flex:1, border:'none', background:'transparent', color:'var(--text-primary)', outline:'none', fontSize:'0.875rem' }}
                placeholder="Search patient (optional)…" value={patientSearch} onChange={e => setPatientSearch(e.target.value)} />
            )}
            {patient && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setPatient(null); setPatientSearch('') }}>✕</button>}
          </div>
          {patientResults.length > 0 && !patient && (
            <div style={{ position:'absolute',zIndex:50,width:'100%',background:'var(--bg-surface)',border:'1px solid var(--border-color)',borderRadius:'var(--radius-md)',boxShadow:'var(--shadow-lg)',marginTop:4 }}>
              {patientResults.map(p => (
                <div key={p.id} className="dropdown-item" onClick={() => { setPatient(p); setPatientSearch(''); setPatientResults([]) }} style={{ padding:'10px 14px' }}>
                  <div style={{ fontWeight:600 }}>{p.full_name}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{p.patient_id} • {p.phone}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Medicine search */}
        <div style={{ position:'relative' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', background:'var(--bg-surface)', border:`1.5px solid ${searchFocus ? 'var(--color-secondary)' : 'var(--border-color)'}`, borderRadius:'var(--radius-md)', boxShadow: searchFocus ? '0 0 0 3px rgba(20,184,166,0.15)' : 'none', transition:'all 0.2s' }}>
            <Search size={18} style={{ color:'var(--text-muted)' }} />
            <input
              ref={searchRef}
              type="text"
              style={{ flex:1, border:'none', background:'transparent', color:'var(--text-primary)', outline:'none', fontSize:'1rem' }}
              placeholder="Scan barcode or search medicine name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setTimeout(() => setSearchFocus(false), 200)}
              id="pos-search"
              autoFocus
            />
          </div>
          {results.length > 0 && (
            <div style={{ position:'absolute',zIndex:50,width:'100%',background:'var(--bg-surface)',border:'1px solid var(--border-color)',borderRadius:'var(--radius-md)',boxShadow:'var(--shadow-lg)',marginTop:4 }}>
              {results.map(m => (
                <div key={m.id} className="dropdown-item" onClick={() => addToCart(m)} style={{ padding:'12px 16px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{m.name}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{m.generic_name} • Stock: {m.quantity} {m.unit}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontWeight:700, color:'var(--color-secondary)' }}>₹{parseFloat(m.selling_price).toFixed(2)}</div>
                      <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>GST: {m.gst_percentage}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart items */}
        <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:8 }}>
          {cart.length === 0 ? (
            <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', gap:12 }}>
              <ShoppingCart size={60} style={{ opacity:0.2 }} />
              <p>Search and add medicines to cart</p>
            </div>
          ) : cart.map((item, idx) => (
            <motion.div key={item.medicine_id} initial={{ opacity:0,x:-20 }} animate={{ opacity:1,x:0 }}
              style={{ background:'var(--bg-surface)', border:'1px solid var(--border-color)', borderRadius:'var(--radius-md)', padding:'12px 16px', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:'0.875rem' }}>{item.name}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>₹{item.unit_price.toFixed(2)} × {item.quantity} = <strong style={{ color:'var(--color-secondary)' }}>₹{(item.unit_price * item.quantity).toFixed(2)}</strong></div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <button className="btn btn-outline btn-icon btn-sm" onClick={() => updateQty(idx, item.quantity-1)} disabled={item.quantity<=1}>-</button>
                <span style={{ minWidth:32, textAlign:'center', fontWeight:700 }}>{item.quantity}</span>
                <button className="btn btn-outline btn-icon btn-sm" onClick={() => updateQty(idx, item.quantity+1)} disabled={item.quantity>=item.max}>+</button>
              </div>
              <button className="btn btn-ghost btn-icon btn-sm" style={{ color:'var(--color-danger)' }} onClick={() => removeItem(idx)}><Trash2 size={14}/></button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right — Billing Summary */}
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div className="card" style={{ flex:1 }}>
          <h4 style={{ marginBottom:16, paddingBottom:12, borderBottom:'1px solid var(--border-color)' }}>🧾 Bill Summary</h4>

          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
            {[['Subtotal', `₹${subtotal.toFixed(2)}`], ['GST', `₹${taxAmt.toFixed(2)}`]].map(([l,v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.875rem', color:'var(--text-secondary)' }}>
                <span>{l}</span><span>{v}</span>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'0.875rem', color:'var(--text-secondary)' }}>
              <span>Discount %</span>
              <input type="number" min="0" max="100" step="0.5" value={discount}
                onChange={e => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value)||0)))}
                style={{ width:70, padding:'4px 8px', textAlign:'right', background:'var(--bg-surface-2)', border:'1.5px solid var(--border-color)', borderRadius:6, color:'var(--text-primary)', fontSize:'0.875rem' }}
              />
            </div>
            {discount > 0 && (
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.875rem', color:'var(--color-success)' }}>
                <span>Discount Amount</span><span>-₹{discAmt.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div style={{ background:'linear-gradient(135deg, rgba(20,184,166,0.1), rgba(59,130,246,0.1))', borderRadius:'var(--radius-md)', padding:16, marginBottom:16, textAlign:'center' }}>
            <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:4 }}>TOTAL AMOUNT</div>
            <div style={{ fontSize:'2.5rem', fontWeight:900, color:'var(--color-secondary)', fontFamily:'var(--font-mono)' }}>₹{total.toFixed(2)}</div>
          </div>

          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {['cash','card','upi','insurance'].map(m => (
                <button key={m} type="button"
                  style={{ padding:'8px 12px', borderRadius:'var(--radius-md)', border:`1.5px solid ${payMethod===m ? 'var(--color-secondary)' : 'var(--border-color)'}`, background: payMethod===m ? 'rgba(20,184,166,0.1)' : 'var(--bg-surface-2)', color: payMethod===m ? 'var(--color-secondary)' : 'var(--text-secondary)', fontWeight:600, fontSize:'0.8rem', cursor:'pointer', textTransform:'capitalize', transition:'all 0.15s' }}
                  onClick={() => setPayMethod(m)}
                >{m}</button>
              ))}
            </div>
          </div>

          {payMethod === 'cash' && (
            <div className="form-group">
              <label className="form-label">Amount Tendered (₹)</label>
              <input type="number" step="0.01" min={total} className="form-control"
                placeholder={total.toFixed(2)} value={paidAmt}
                onChange={e => setPaidAmt(e.target.value)}
                style={{ fontSize:'1.1rem', fontWeight:700, textAlign:'right' }}
              />
              {parseFloat(paidAmt) >= total && (
                <div style={{ textAlign:'right', marginTop:6, color:'var(--color-success)', fontWeight:700, fontSize:'0.9rem' }}>
                  Change: ₹{(parseFloat(paidAmt)-total).toFixed(2)}
                </div>
              )}
            </div>
          )}

          <button
            className="btn btn-success w-full btn-lg"
            onClick={handleCheckout}
            disabled={processing || cart.length === 0}
            id="checkout-btn"
            style={{ background:'linear-gradient(135deg,var(--color-success),#16A34A)', marginTop:'auto' }}
          >
            {processing ? 'Processing…' : <><Check size={20}/> Complete Sale</>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default POSBilling
