import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import MainLayout from './components/layout/MainLayout'

// Auth pages
import Login from './pages/Login'

// Main pages
import Dashboard from './pages/dashboard/Dashboard'
import Medicines from './pages/medicines/Medicines'
import MedicineDetail from './pages/medicines/MedicineDetail'
import MedicineForm from './pages/medicines/MedicineForm'
import Suppliers from './pages/suppliers/Suppliers'
import Purchases from './pages/purchases/Purchases'
import PurchaseForm from './pages/purchases/PurchaseForm'
import ExpiryManagement from './pages/expiry/ExpiryManagement'
import Profile from './pages/profile/Profile'

// Additional pages
import Sales from './pages/sales/Sales'
import POSBilling from './pages/sales/POSBilling'
import Patients from './pages/patients/Patients'
import PatientDetail from './pages/patients/PatientDetail'
import Reports from './pages/reports/Reports'
import Prescriptions from './pages/prescriptions/Prescriptions'
import Doctors from './pages/doctors/Doctors'
import Notifications from './pages/notifications/Notifications'

// Admin pages
import SuperAdmin from './pages/admin/SuperAdmin'
import AdminSettings from './pages/admin/AdminSettings'
import AdminUsers from './pages/admin/AdminUsers'
import AdminAuditLogs from './pages/admin/AdminAuditLogs'

// Protect routes that require login
const ProtectedLayout = () => {
  const user = localStorage.getItem('medistock_user')
  if (!user) {
    return <Navigate to="/" replace />
  }
  return <MainLayout />
}

// Admin layout check
const AdminLayout = () => {
  const user = localStorage.getItem('medistock_user')
  if (!user) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}

function App() {
  const ADMIN_ROUTE = import.meta.env.VITE_ADMIN_ROUTE || '/super-admin'

  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard"         element={<Dashboard />} />
          <Route path="/medicines"         element={<Medicines />} />
          <Route path="/inventory"         element={<Medicines />} />
          <Route path="/medicines/new"     element={<MedicineForm />} />
          <Route path="/medicines/:id"     element={<MedicineDetail />} />
          <Route path="/medicines/:id/edit" element={<MedicineForm />} />
          <Route path="/suppliers"         element={<Suppliers />} />
          <Route path="/purchases"         element={<Purchases />} />
          <Route path="/purchases/new"     element={<PurchaseForm />} />
          <Route path="/expiry"            element={<ExpiryManagement />} />
          <Route path="/profile"           element={<Profile />} />
          <Route path="/sales"             element={<Sales />} />
          <Route path="/sales/pos"         element={<POSBilling />} />
          <Route path="/patients"          element={<Patients />} />
          <Route path="/patients/:id"      element={<PatientDetail />} />
          <Route path="/customers"         element={<Patients />} />
          <Route path="/reports"           element={<Reports />} />
          <Route path="/prescriptions"     element={<Prescriptions />} />
          <Route path="/doctors"           element={<Doctors />} />
          <Route path="/notifications"     element={<Notifications />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path={ADMIN_ROUTE} element={<SuperAdmin />} />
          <Route path={`${ADMIN_ROUTE}/settings`} element={<AdminSettings />} />
          <Route path={`${ADMIN_ROUTE}/users`} element={<AdminUsers />} />
          <Route path={`${ADMIN_ROUTE}/audit-logs`} element={<AdminAuditLogs />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
