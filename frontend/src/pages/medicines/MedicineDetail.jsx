import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Edit2, Package, Clock, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const MedicineDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [medicine, setMedicine] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/medicines/${id}`)
      .then(r => setMedicine(r.data.data))
      .catch(() => toast.error('Medicine not found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:300 }}><div className="spinner" style={{ width:40,height:40,borderWidth:3 }} /></div>
  if (!medicine) return <div style={{ padding:32, textAlign:'center', color:'var(--text-muted)' }}>Medicine not found</div>

  const isExpired   = new Date(medicine.expiry_date) < new Date()
  const isNearExpiry = medicine.days_to_expiry <= 30 && medicine.days_to_expiry >= 0
  const isLowStock  = medicine.quantity <= medicine.reorder_level && medicine.quantity > 0
  const isOutOfStock = medicine.quantity === 0

  const InfoRow = ({ label, value, mono }) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border-color)' }}>
      <span style={{ fontSize:'0.8125rem', color:'var(--text-muted)', fontWeight:500 }}>{label}</span>
      <span style={{ fontSize:'0.875rem', color:'var(--text-primary)', fontWeight:600, fontFamily: mono ? 'var(--font-mono)' : 'inherit' }}>{value || '—'}</span>
    </div>
  )

  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }}>
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/medicines')} style={{ marginBottom:8 }}>
            <ArrowLeft size={16}/> Back to Inventory
          </button>
          <h2 className="page-title">{medicine.name}</h2>
          <p className="page-subtitle">{medicine.generic_name} • {medicine.medicine_id}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={() => navigate(`/medicines/${id}/edit`)}>
            <Edit2 size={14}/> Edit Medicine
          </button>
        </div>
      </div>

      {/* Alerts */}
      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
        {isExpired    && <div className="alert alert-danger"><AlertTriangle size={16}/> This medicine has EXPIRED on {new Date(medicine.expiry_date).toLocaleDateString('en-IN')}</div>}
        {isNearExpiry && !isExpired && <div className="alert alert-warning"><AlertTriangle size={16}/> Expiring in {medicine.days_to_expiry} days — {new Date(medicine.expiry_date).toLocaleDateString('en-IN')}</div>}
        {isOutOfStock && <div className="alert alert-danger"><Package size={16}/> Out of Stock</div>}
        {isLowStock   && !isOutOfStock && <div className="alert alert-warning"><TrendingDown size={16}/> Low Stock — Only {medicine.quantity} {medicine.unit} remaining (Reorder at: {medicine.reorder_level})</div>}
      </div>

      <div className="grid-3" style={{ alignItems:'start', gap:24 }}>
        {/* Basic Info */}
        <div className="card" style={{ gridColumn:'span 2' }}>
          <h4 style={{ marginBottom:16 }}>📋 Medicine Details</h4>
          <div className="grid-2">
            <div>
              <InfoRow label="Medicine ID"   value={medicine.medicine_id} mono />
              <InfoRow label="Barcode"        value={medicine.barcode} mono />
              <InfoRow label="Generic Name"   value={medicine.generic_name} />
              <InfoRow label="Brand Name"     value={medicine.brand_name} />
              <InfoRow label="Manufacturer"   value={medicine.manufacturer} />
              <InfoRow label="Category"       value={medicine.category_name} />
            </div>
            <div>
              <InfoRow label="Batch Number"   value={medicine.batch_number} mono />
              <InfoRow label="Mfg. Date"      value={medicine.manufacturing_date ? new Date(medicine.manufacturing_date).toLocaleDateString('en-IN') : '—'} />
              <InfoRow label="Expiry Date"    value={new Date(medicine.expiry_date).toLocaleDateString('en-IN')} />
              <InfoRow label="Storage"        value={medicine.storage_conditions} />
              <InfoRow label="Unit"           value={medicine.unit} />
              <InfoRow label="Status"         value={medicine.status} />
            </div>
          </div>
          {medicine.description && (
            <div style={{ marginTop:16, padding:14, background:'var(--bg-surface-2)', borderRadius:8 }}>
              <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:6 }}>DESCRIPTION</div>
              <p style={{ fontSize:'0.875rem', color:'var(--text-secondary)', margin:0 }}>{medicine.description}</p>
            </div>
          )}
        </div>

        {/* Pricing & Stock */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="card">
            <h4 style={{ marginBottom:16 }}>💰 Pricing</h4>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[
                { label:'Purchase Price', value:`₹${parseFloat(medicine.purchase_price).toLocaleString('en-IN')}`, color:'var(--color-warning)' },
                { label:'Selling Price',  value:`₹${parseFloat(medicine.selling_price).toLocaleString('en-IN')}`,  color:'var(--color-success)' },
                { label:'GST Rate',       value:`${medicine.gst_percentage}%`, color:'var(--text-primary)' },
                { label:'Profit Margin',  value:`₹${(parseFloat(medicine.selling_price) - parseFloat(medicine.purchase_price)).toFixed(2)}`, color:'var(--color-secondary)' },
              ].map(row => (
                <div key={row.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{row.label}</span>
                  <span style={{ fontSize:'1rem', fontWeight:700, color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h4 style={{ marginBottom:16 }}>📦 Stock Status</h4>
            <div style={{ textAlign:'center', marginBottom:16 }}>
              <div style={{ fontSize:'2.5rem', fontWeight:900, color: isOutOfStock ? 'var(--color-danger)' : isLowStock ? 'var(--color-warning)' : 'var(--color-success)' }}>
                {medicine.quantity}
              </div>
              <div style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{medicine.unit} available</div>
            </div>
            <div className="progress-bar" style={{ marginBottom:12 }}>
              <div className="progress-fill" style={{
                width: `${Math.min(100, (medicine.quantity / (medicine.reorder_level * 3)) * 100)}%`,
                background: isOutOfStock ? 'var(--color-danger)' : isLowStock ? 'var(--color-warning)' : 'var(--color-success)'
              }} />
            </div>
            <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', textAlign:'center' }}>Reorder at: {medicine.reorder_level} {medicine.unit}</div>
          </div>
        </div>

        {/* Stock History */}
        {(medicine.history || []).length > 0 && (
          <div className="card" style={{ gridColumn:'span 3' }}>
            <h4 style={{ marginBottom:16 }}>📈 Stock Movement History</h4>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>Type</th><th>Change</th><th>Before</th><th>After</th><th>Reference</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {(medicine.history || []).map(h => (
                    <tr key={h.id}>
                      <td><span className={`badge ${h.type==='purchase'?'badge-success':h.type==='sale'?'badge-info':'badge-neutral'}`} style={{ textTransform:'capitalize' }}>{h.type}</span></td>
                      <td style={{ fontWeight:700, color: h.quantity_change > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {h.quantity_change > 0 ? '+' : ''}{h.quantity_change}
                      </td>
                      <td style={{ color:'var(--text-muted)' }}>{h.quantity_before}</td>
                      <td style={{ fontWeight:600 }}>{h.quantity_after}</td>
                      <td style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>{h.reference_type} #{h.reference_id}</td>
                      <td style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{new Date(h.created_at).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default MedicineDetail
