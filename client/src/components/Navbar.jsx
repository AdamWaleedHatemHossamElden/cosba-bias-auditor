import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        🧠 <span style={styles.logoText}>CoS-BA</span>
      </div>
      <div style={styles.links}>
        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
        <Link to="/feed" style={styles.link}>Browse</Link>
        <Link to="/login" style={styles.link}>Login</Link>
        <Link to="/register" style={styles.registerBtn}>Register</Link>
      </div>
    </nav>
  )
}

const styles = {
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2.5rem', background: 'rgba(15,12,41,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 1000 },
  logo: { fontSize: '1.3rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  logoText: { background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  links: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
  link: { color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.95rem' },
  registerBtn: { background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', color: '#fff', padding: '0.4rem 1.2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }
}

export default Navbar