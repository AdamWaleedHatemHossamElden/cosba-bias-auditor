import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../services/api'

function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await API.post('/auth/register', form)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div style={styles.page}>
      {/* Left - Form */}
      <div style={styles.left}>
        <div style={styles.logo}>🧠 <span style={styles.logoText}>CoS-BA</span></div>
        <h2 style={styles.title}>Create Your<br />Account</h2>
        <p style={styles.subtitle}>Join the community to flag AI biases</p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} type="text" name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
          <input style={styles.input} type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input style={styles.input} type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
          <button type="submit" style={styles.primaryBtn}>Create Account</button>
        </form>

        <p style={styles.link}>
          Already have an account? <Link to="/login" style={styles.linkColor}>Sign In</Link>
        </p>
      </div>

      {/* Right - Visual Panel */}
      <div style={styles.right}>
        <div style={styles.rightContent}>
          <div style={styles.iconCircle}>🌍</div>
          <h3 style={styles.rightTitle}>Join the Movement</h3>
          <p style={styles.rightSubtitle}>Help build a fairer AI future by contributing your perspective to our crowd-sourced bias detection platform.</p>
          <div style={styles.featureList}>
            <div style={styles.feature}>🚩 Report Bias</div>
            <div style={styles.feature}>📤 Upload Content</div>
            <div style={styles.feature}>🔒 Secure & Private</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', background: '#fff' },
  left: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem 5rem' },
  logo: { fontSize: '1.2rem', fontWeight: '800', marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  logoText: { background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  title: { fontSize: '2.5rem', fontWeight: '800', color: '#1a1a2e', lineHeight: 1.2, marginBottom: '0.75rem' },
  subtitle: { color: '#888', fontSize: '0.95rem', marginBottom: '2.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' },
  input: { padding: '0.9rem 1.2rem', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '1rem', color: '#1a1a2e', outline: 'none', background: '#f9fafb' },
  primaryBtn: { padding: '0.9rem', background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem' },
  error: { background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' },
  link: { color: '#888', fontSize: '0.9rem' },
  linkColor: { color: '#a78bfa', textDecoration: 'none', fontWeight: '600' },
  right: { flex: 1, background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' },
  rightContent: { textAlign: 'center', color: '#fff' },
  iconCircle: { fontSize: '4rem', marginBottom: '2rem', display: 'block' },
  rightTitle: { fontSize: '1.8rem', fontWeight: '700', marginBottom: '1rem', background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  rightSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '300px', margin: '0 auto 2.5rem auto' },
  featureList: { display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' },
  feature: { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.6rem 1.5rem', borderRadius: '30px', fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)' }
}

export default Register