import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, Box, TrendingUp, HeartPulse, Sparkles } from 'lucide-react'

const Landing = () => {
  return (
    <div className="auth-bg" style={{ minHeight: '100vh', padding: '4rem 1rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="auth-card"
        style={{ maxWidth: 980, margin: '0 auto', padding: '3rem 2rem' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16, color: 'var(--color-primary)', fontWeight: 700 }}>
              <ShieldCheck size={20} /> Secure Pharmacy Management
            </div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: 18, lineHeight: 1.05 }}>MediStock Pro Enterprise AI</h1>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: 640, marginBottom: 24 }}>
              A complete medical inventory and sales dashboard built for pharmacies, clinics, and hospitals.
              Track medicines, suppliers, purchases, sales, patients, prescriptions, expiry alerts, reports and AI insights from one central portal.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
              <Link to="/dashboard" className="btn btn-primary btn-lg">View Dashboard</Link>
              <Link to="/profile" className="btn btn-secondary btn-lg">Explore Features</Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
              <div style={{ padding: 18, border: '1px solid var(--border-color)', borderRadius: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}><TrendingUp size={18} />
                  <strong>Sales Insights</strong>
                </div>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Visualize take-home sales performance and stock trends.</p>
              </div>
              <div style={{ padding: 18, border: '1px solid var(--border-color)', borderRadius: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}><Box size={18} />
                  <strong>Inventory Control</strong>
                </div>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Manage medicines, suppliers, purchases, and expiry alerts centrally.</p>
              </div>
              <div style={{ padding: 18, border: '1px solid var(--border-color)', borderRadius: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}><HeartPulse size={18} />
                  <strong>Patient Care</strong>
                </div>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Keep patient records, prescriptions, and appointment details organized.</p>
              </div>
              <div style={{ padding: 18, border: '1px solid var(--border-color)', borderRadius: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}><Sparkles size={18} />
                  <strong>Smart Alerts</strong>
                </div>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Receive timely stock and notification alerts to keep the pharmacy running smoothly.</p>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', borderRadius: '1.5rem', padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div className="badge badge-primary">Public</div>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Landing page</span>
              </div>
              <h2 style={{ margin: 0, fontSize: '1.35rem' }}>Open portal for your pharmacy team</h2>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
              <li style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ marginTop: 4 }}>•</span>
                <span style={{ color: 'var(--text-muted)' }}>Browse the app interface and dashboard without authentication.</span>
              </li>
              <li style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ marginTop: 4 }}>•</span>
                <span style={{ color: 'var(--text-muted)' }}>Inventory, sales, and notification pages are accessible immediately.</span>
              </li>
              <li style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ marginTop: 4 }}>•</span>
                <span style={{ color: 'var(--text-muted)' }}>Use the app as a public-facing product landing screen.</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Landing
