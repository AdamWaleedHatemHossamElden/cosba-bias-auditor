import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Home, Rss, BarChart2, Upload, Shield, LogOut, Brain, User
} from 'lucide-react'

function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/feed', label: 'Feed', icon: Rss },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart2 },
    { path: '/upload', label: 'Upload', icon: Upload },
    { path: '/profile', label: 'Profile', icon: User },
    ...(user?.role === 'admin' ? [{ path: '/admin', label: 'Admin', icon: Shield }] : [])
  ]

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <Brain size={24} color="#a78bfa" />
        <span style={styles.logoText}>CoS-BA</span>
      </div>

      {/* Nav Items */}
      <nav style={styles.nav}>
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path
          return (
            <Link key={path} to={path} style={isActive ? styles.activeLink : styles.link}>
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom - User + Logout */}
      <div style={styles.bottom}>
        {user ? (
          <>
            <div style={styles.userInfo}>
              <div style={styles.avatar}>{user?.username?.[0]?.toUpperCase()}</div>
              <div>
                <p style={styles.username}>{user?.username}</p>
                <p style={styles.role}>{user?.role}</p>
              </div>
            </div>
            <button style={styles.logoutBtn} onClick={handleLogout}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <Link to="/login" style={styles.loginBtn}>Sign In</Link>
        )}
      </div>
    </div>
  )
}

const styles = {
  sidebar: { width: '240px', minHeight: '100vh', background: '#0f0c29', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', padding: '1.5rem 1rem', position: 'fixed', top: 0, left: 0, zIndex: 100 },
  logo: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', marginBottom: '2rem' },
  logoText: { fontSize: '1.2rem', fontWeight: '800', background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  nav: { display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 },
  link: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0.75rem', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.95rem', transition: 'all 0.2s' },
  activeLink: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0.75rem', borderRadius: '8px', color: '#fff', textDecoration: 'none', fontSize: '0.95rem', background: 'rgba(167,139,250,0.15)', borderLeft: '3px solid #a78bfa' },
  bottom: { borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', marginBottom: '0.5rem' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem', color: '#fff' },
  username: { color: '#fff', fontSize: '0.9rem', fontWeight: '600', margin: 0 },
  role: { color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', margin: 0, textTransform: 'capitalize' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.7rem 0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' },
  loginBtn: { display: 'block', width: '100%', padding: '0.7rem 0.75rem', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.25)', color: '#fff', borderRadius: '8px', textDecoration: 'none', textAlign: 'center', fontSize: '0.9rem', fontWeight: '600' }
}

export default Sidebar
