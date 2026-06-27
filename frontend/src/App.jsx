import { Routes, Route, Navigate } from 'react-router-dom'
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

// Protect routes that require login
const ProtectedLayout = () => {
  const user = localStorage.getItem('medistock_user')
  if (!user) {
    return <Navigate to="/" replace />
  }
  return <MainLayout />
}

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard"         element={<Dashboard />} />
          <Route path="/medicines"         element={<Medicines />} />
          <Route path="/medicines/new"     element={<MedicineForm />} />
          <Route path="/medicines/:id"     element={<MedicineDetail />} />
          <Route path="/medicines/:id/edit" element={<MedicineForm />} />
          <Route path="/suppliers"         element={<Suppliers />} />
          <Route path="/purchases"         element={<Purchases />} />
          <Route path="/purchases/new"     element={<PurchaseForm />} />
          <Route path="/expiry"            element={<ExpiryManagement />} />
          <Route path="/profile"           element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
