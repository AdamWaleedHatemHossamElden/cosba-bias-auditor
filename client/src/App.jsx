import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Feed from './pages/Feed'
import Report from './pages/Report'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import ContentDetail from './pages/ContentDetail'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'

function Layout({ children }) {
  const location = useLocation()
  const showSidebar = !['/login', '/register'].includes(location.pathname)

  return (
    <div style={{ display: 'flex' }}>
      {showSidebar && <Sidebar />}
      <div style={{ marginLeft: showSidebar ? '240px' : '0', flex: 1, minHeight: '100vh' }}>
        {children}
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Routes with sidebar */}
          <Route path="/" element={<Home />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/content/:id" element={<ContentDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/report/:id" element={<ProtectedRoute><Report /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
