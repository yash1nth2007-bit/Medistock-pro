import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler, ArcElement } from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import { Download, Calendar, RefreshCw } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler, ArcElement)

const CHART_OPT = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: 'rgba(15,23,42,0.95)', borderColor: 'rgba(255,255,255,0.08)', borderWidth:1, titleColor:'#F8FAFC', bodyColor:'#94A3B8', padding:12, cornerRadius:10 }
  },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color:'#64748B', font:{size:11} } },
    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color:'#64748B', font:{size:11} } }
  }
}

const Reports = () => {
  const [tab, setTab]         = useState('sales')
  const [data, setData]       = useState({})
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    from_date: new Date(new Date().setMonth(new Date().getMonth()-3)).toISOString().split('T')[0],
    to_date:   new Date().toISOString().split('T')[0]
  })

  const loadReport = async () => {
    setLoading(true)
    try {
      const params = { ...dateRange }
      const [salesRes, purchRes, invRes, expiryRes] = await Promise.all([
        api.get('/reports/sales', { params }),
        api.get('/reports/purchases', { params }),
        api.get('/reports/inventory'),
        api.get('/reports/expiry', { params: { days: 90 } }),
      ])
      setData({ sales: salesRes.data.data, purchases: purchRes.data.data, inventory: invRes.data.data, expiry: expiryRes.data.data })
    } catch { toast.error('Failed to load reports') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadReport() }, [dateRange])

  const buildSalesChart = () => {
    const grouped = {}
    ;(data.sales || []).forEach(s => {
      const d = s.sale_date?.split('T')[0] || s.sale_date
      grouped[d] = (grouped[d] || 0) + parseFloat(s.total_amount)
    })
    const labels = Object.keys(grouped).sort()
    return {
      labels,
      datasets: [{
        label: 'Revenue',
        data: labels.map(l => grouped[l]),
        borderColor: 'rgba(20,184,166,1)',
        backgroundColor: 'rgba(20,184,166,0.15)',
        tension: 0.4, fill: true, borderWidth: 2
      }]
    }
  }

  const TOTALS = {
    sales_revenue: (data.sales||[]).reduce((a,s) => a + parseFloat(s.total_amount||0), 0),
    purchase_cost: (data.purchases||[]).reduce((a,p) => a + parseFloat(p.total_amount||0), 0),
    inventory_val: (data.inventory||[]).reduce((a,m) => a + parseFloat(m.selling_price||0) * parseInt(m.quantity||0), 0),
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16); doc.text('MediStock Pro — Sales Report', 14, 18)
    doc.setFontSize(10); doc.setTextColor(100)
    doc.text(`Period: ${dateRange.from_date} to ${dateRange.to_date}`, 14, 26)
    autoTable(doc, {
      startY: 32,
      head: [['Invoice','Patient','Amount','Method','Date']],
      body: (data.sales||[]).map(s => [s.invoice_number||'', s.patient_name||'Walk-in', `₹${parseFloat(s.total_amount||0).toLocaleString('en-IN')}`, s.payment_method||'', s.sale_date?.split('T')[0]||'']),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [20, 184, 166] }
    })
    doc.save('medistock-sales-report.pdf')
    toast.success('PDF exported!')
  }

  const TABS = [
    { id:'sales',     label:'Sales Report' },
    { id:'purchases', label:'Purchase Report' },
    { id:'inventory', label:'Inventory Report' },
    { id:'expiry',    label:'Expiry Report' },
  ]

  return (
    <div>
      <div className="page-header">
        <div><h2 className="page-title">Reports & Analytics</h2><p className="page-subtitle">Comprehensive business intelligence</p></div>
        <div className="page-actions">
          <input type="date" className="form-control" style={{width:'auto'}} value={dateRange.from_date} onChange={e=>setDateRange(r=>({...r,from_date:e.target.value}))}/>
          <input type="date" className="form-control" style={{width:'auto'}} value={dateRange.to_date}   onChange={e=>setDateRange(r=>({...r,to_date:e.target.value}))}/>
          <button className="btn btn-outline btn-sm" onClick={loadReport}><RefreshCw size={14}/></button>
          <button className="btn btn-primary btn-sm" onClick={exportPDF} id="export-pdf-btn"><Download size={14}/> Export PDF</button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="kpi-grid" style={{ marginBottom:24 }}>
        <div className="kpi-card success"><div className="kpi-icon success">💰</div><div className="kpi-value">{loading?'—':`₹${TOTALS.sales_revenue.toLocaleString('en-IN')}`}</div><div className="kpi-label">Total Revenue</div></div>
        <div className="kpi-card warning"><div className="kpi-icon warning">🛒</div><div className="kpi-value">{loading?'—':`₹${TOTALS.purchase_cost.toLocaleString('en-IN')}`}</div><div className="kpi-label">Purchase Cost</div></div>
        <div className="kpi-card primary"><div className="kpi-icon primary">📦</div><div className="kpi-value">{loading?'—':`₹${TOTALS.inventory_val.toLocaleString('en-IN')}`}</div><div className="kpi-label">Inventory Value</div></div>
        <div className="kpi-card accent"><div className="kpi-icon accent">📈</div><div className="kpi-value">{loading?'—':`₹${(TOTALS.sales_revenue-TOTALS.purchase_cost).toLocaleString('en-IN')}`}</div><div className="kpi-label">Gross Profit</div></div>
      </div>

      {/* Sales Trend Chart */}
      <div className="card" style={{ marginBottom:24 }}>
        <div className="chart-header"><div><div className="chart-title">Revenue Trend</div><div className="chart-subtitle">{dateRange.from_date} to {dateRange.to_date}</div></div></div>
        <div style={{ height:240 }}>
          {loading ? <div className="skeleton" style={{height:'100%',borderRadius:'var(--radius-md)'}}/> :
           (data.sales||[]).length > 0 ? <Line data={buildSalesChart()} options={CHART_OPT}/> :
           <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-muted)'}}>No sales data</div>}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">{TABS.map(t=><button key={t.id} className={`tab-btn ${tab===t.id?'active':''}`} onClick={()=>setTab(t.id)}>{t.label}</button>)}</div>

      <div className="table-wrapper">
        {tab === 'sales' && (
          <table className="data-table">
            <thead><tr><th>Invoice</th><th>Patient</th><th>Amount</th><th>Tax</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {loading ? Array(6).fill(0).map((_,i)=><tr key={i}>{Array(7).fill(0).map((__,j)=><td key={j}><div className="skeleton" style={{height:16,borderRadius:4}}/></td>)}</tr>) :
               (data.sales||[]).map(s=>(
                <tr key={s.id||s.invoice_number}>
                  <td className="font-mono" style={{color:'var(--color-accent)',fontSize:'0.82rem'}}>{s.invoice_number}</td>
                  <td style={{fontWeight:600,fontSize:'0.875rem'}}>{s.patient_name||'Walk-in'}</td>
                  <td style={{fontWeight:700,color:'var(--color-success)'}}>₹{parseFloat(s.total_amount||0).toLocaleString('en-IN')}</td>
                  <td style={{color:'var(--text-muted)'}}>₹{parseFloat(s.tax_amount||0).toLocaleString('en-IN')}</td>
                  <td><span className="badge badge-info" style={{textTransform:'capitalize'}}>{s.payment_method}</span></td>
                  <td><span className={`badge ${s.payment_status==='paid'?'badge-success':s.payment_status==='partial'?'badge-warning':'badge-danger'}`}>{s.payment_status}</span></td>
                  <td style={{color:'var(--text-muted)',fontSize:'0.82rem'}}>{s.sale_date?.split('T')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'purchases' && (
          <table className="data-table">
            <thead><tr><th>PO Number</th><th>Supplier</th><th>Amount</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {loading ? Array(6).fill(0).map((_,i)=><tr key={i}>{Array(6).fill(0).map((__,j)=><td key={j}><div className="skeleton" style={{height:16,borderRadius:4}}/></td>)}</tr>) :
               (data.purchases||[]).map(p=>(
                <tr key={p.id}>
                  <td className="font-mono" style={{color:'var(--color-accent)',fontSize:'0.82rem'}}>{p.purchase_number}</td>
                  <td style={{fontWeight:600,fontSize:'0.875rem'}}>{p.supplier_name}</td>
                  <td style={{fontWeight:700}}>₹{parseFloat(p.total_amount||0).toLocaleString('en-IN')}</td>
                  <td><span className={`badge ${p.payment_status==='paid'?'badge-success':p.payment_status==='partial'?'badge-warning':'badge-danger'}`}>{p.payment_status}</span></td>
                  <td><span className={`badge ${p.status==='received'?'badge-success':p.status==='pending'?'badge-warning':'badge-danger'}`}>{p.status}</span></td>
                  <td style={{color:'var(--text-muted)',fontSize:'0.82rem'}}>{p.purchase_date?.split('T')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'inventory' && (
          <table className="data-table">
            <thead><tr><th>Medicine</th><th>Category</th><th>Stock</th><th>Unit Price</th><th>Inventory Value</th><th>Status</th></tr></thead>
            <tbody>
              {loading ? Array(8).fill(0).map((_,i)=><tr key={i}>{Array(6).fill(0).map((__,j)=><td key={j}><div className="skeleton" style={{height:16,borderRadius:4}}/></td>)}</tr>) :
               (data.inventory||[]).map(m=>(
                <tr key={m.id}>
                  <td>
                    <div style={{fontWeight:600,fontSize:'0.875rem'}}>{m.name}</div>
                    <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{m.generic_name}</div>
                  </td>
                  <td style={{color:'var(--text-secondary)'}}>{m.category_name||'—'}</td>
                  <td style={{fontWeight:600}}>{m.quantity} <span style={{color:'var(--text-muted)',fontSize:'0.78rem'}}>{m.unit}</span></td>
                  <td>₹{parseFloat(m.selling_price||0).toLocaleString('en-IN')}</td>
                  <td style={{fontWeight:700,color:'var(--color-secondary)'}}>₹{(parseFloat(m.selling_price||0)*parseInt(m.quantity||0)).toLocaleString('en-IN')}</td>
                  <td><span className={`badge ${m.stock_status==='ok'?'badge-success':m.stock_status==='low_stock'?'badge-warning':'badge-danger'}`}>{m.stock_status?.replace('_',' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'expiry' && (
          <table className="data-table">
            <thead><tr><th>Medicine</th><th>Batch</th><th>Expiry Date</th><th>Days Left</th><th>Qty</th><th>Loss Risk</th></tr></thead>
            <tbody>
              {loading ? Array(5).fill(0).map((_,i)=><tr key={i}>{Array(6).fill(0).map((__,j)=><td key={j}><div className="skeleton" style={{height:16,borderRadius:4}}/></td>)}</tr>) :
               (data.expiry||[]).map(m=>(
                <tr key={m.id}>
                  <td><div style={{fontWeight:600}}>{m.name}</div><div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{m.medicine_id}</div></td>
                  <td className="font-mono" style={{fontSize:'0.8rem',color:'var(--text-secondary)'}}>{m.batch_number||'—'}</td>
                  <td style={{fontWeight:600,color:m.days_left<=30?'var(--color-danger)':'var(--color-warning)'}}>{new Date(m.expiry_date).toLocaleDateString('en-IN')}</td>
                  <td><span className={`badge ${(m.days_left||0)<=0?'badge-danger':(m.days_left||0)<=30?'badge-danger':'badge-warning'}`}>{(m.days_left||0)<=0?'EXPIRED':m.days_left+'d'}</span></td>
                  <td>{m.quantity} {m.unit}</td>
                  <td style={{fontWeight:700,color:'var(--color-danger)'}}>₹{(parseFloat(m.selling_price||0)*parseInt(m.quantity||0)).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Reports
