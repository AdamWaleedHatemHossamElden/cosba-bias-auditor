import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { X, Flag, CheckCircle, XCircle, ChevronDown } from 'lucide-react'
import API from '../services/api'

const confettiColors = ['#a78bfa', '#60a5fa', '#f472b6', '#34d399', '#fbbf24', '#f87171', '#818cf8', '#38bdf8']
const confettiPieces = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  color: confettiColors[i % confettiColors.length],
  left: Math.random() * 100,
  delay: Math.random() * 1.2,
  duration: 1.5 + Math.random() * 1.5,
  size: 6 + Math.random() * 8,
  shape: Math.random() > 0.5 ? 'rect' : 'circle'
}))

// Confetti particle generator
function Confetti() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: '20px', pointerEvents: 'none' }}>
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(320px) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {confettiPieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.left}%`,
          top: 0,
          width: p.shape === 'rect' ? `${p.size}px` : `${p.size}px`,
          height: p.shape === 'rect' ? `${p.size * 0.4}px` : `${p.size}px`,
          borderRadius: p.shape === 'circle' ? '50%' : '2px',
          background: p.color,
          animation: `confettiFall ${p.duration}s ease-in ${p.delay}s both`
        }} />
      ))}
    </div>
  )
}

function Report() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ bias_category: '', secondary_category: '', description: '' })
  const [modal, setModal] = useState(null)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [secondaryOpen, setSecondaryOpen] = useState(false)

  const biasCategories = ['Gender Stereotyping', 'Racial Bias', 'Ageism', 'Religious Bias', 'Socioeconomic Bias', 'Intersectional Bias', 'Other']

  useEffect(() => {
    const handler = () => { setCategoryOpen(false); setSecondaryOpen(false) }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await API.post('/reports', { ...form, content_id: id })
      setModal({ type: 'success' })
    } catch (err) {
      setModal({ type: 'error', message: err.response?.data?.message || 'Submission failed. Please try again.' })
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Report Bias</h2>
            <p style={styles.subtitle}>Help us identify bias in this AI-generated content</p>
          </div>
          <button style={styles.closeBtn} onClick={() => navigate('/feed')}>
            <X size={18} />
          </button>
        </div>

        {/* Info Banner */}
        <div style={styles.infoBanner}>
          <Flag size={16} color="#a78bfa" />
          <p style={styles.infoText}>Your report helps improve AI fairness and transparency for everyone.</p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Primary Bias Category */}
          <div style={styles.section}>
            <label style={styles.label}>Primary Bias Category <span style={styles.required}>*</span></label>
            <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
              <button type="button" style={styles.selectBtn} onClick={() => { setCategoryOpen(!categoryOpen); setSecondaryOpen(false) }}>
                <span style={{ color: form.bias_category ? '#fff' : 'rgba(255,255,255,0.3)' }}>
                  {form.bias_category || 'Select bias type...'}
                </span>
                <ChevronDown size={16} color="rgba(255,255,255,0.4)"
                  style={{ transform: categoryOpen ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s', flexShrink: 0 }} />
              </button>
              {categoryOpen && (
                <div style={styles.dropdown}>
                  {biasCategories.map(cat => (
                    <div key={cat}
                      style={form.bias_category === cat ? styles.dropdownItemActive : styles.dropdownItem}
                      onMouseEnter={e => { if (form.bias_category !== cat) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                      onMouseLeave={e => { if (form.bias_category !== cat) e.currentTarget.style.background = 'transparent' }}
                      onClick={() => { setForm({ ...form, bias_category: cat }); setCategoryOpen(false) }}>
                      {cat}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Secondary Bias Category */}
          <div style={styles.section}>
            <label style={styles.label}>Secondary Bias Category <span style={styles.optional}>(optional)</span></label>
            <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
              <button type="button" style={styles.selectBtn} onClick={() => { setSecondaryOpen(!secondaryOpen); setCategoryOpen(false) }}>
                <span style={{ color: form.secondary_category ? '#fff' : 'rgba(255,255,255,0.3)' }}>
                  {form.secondary_category || 'Select secondary type...'}
                </span>
                <ChevronDown size={16} color="rgba(255,255,255,0.4)"
                  style={{ transform: secondaryOpen ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s', flexShrink: 0 }} />
              </button>
              {secondaryOpen && (
                <div style={styles.dropdown}>
                  {biasCategories.map(cat => (
                    <div key={cat}
                      style={form.secondary_category === cat ? styles.dropdownItemActive : styles.dropdownItem}
                      onMouseEnter={e => { if (form.secondary_category !== cat) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                      onMouseLeave={e => { if (form.secondary_category !== cat) e.currentTarget.style.background = 'transparent' }}
                      onClick={() => { setForm({ ...form, secondary_category: cat }); setSecondaryOpen(false) }}>
                      {cat}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div style={styles.section}>
            <label style={styles.label}>Description <span style={styles.required}>*</span></label>
            <textarea
              name="description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the bias you observed in this content. Be as specific as possible..."
              style={styles.textarea}
              rows={5}
              required
            />
            <p style={styles.charCount}>{form.description.length} characters</p>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <button type="button" style={styles.cancelBtn} onClick={() => navigate('/feed')}>Cancel</button>
            <button type="submit" style={styles.submitBtn}>Submit Report</button>
          </div>

        </form>
      </div>

      {/* Success Modal with Confetti */}
      {modal?.type === 'success' && (
        <div style={modalStyles.overlay}>
          <div style={{ ...modalStyles.modal, position: 'relative', overflow: 'hidden' }}>
            <Confetti />
            <button style={modalStyles.closeBtn} onClick={() => navigate('/feed')}><X size={16} /></button>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={modalStyles.successIcon}>
                <CheckCircle size={40} color="#22c55e" />
              </div>

              <h3 style={modalStyles.successTitle}>Your Report is Ready!</h3>
              <p style={modalStyles.successSub}>you can find the reports in Reports history</p>

              <div style={modalStyles.reportCard}>
                <div>
                  <p style={modalStyles.reportCardTitle}>Bias Report</p>
                  <p style={modalStyles.reportCardSub}>{form.bias_category || 'Submitted'}</p>
                </div>
                <div style={modalStyles.reportCardBadge}>
                  <Flag size={14} color="#a78bfa" />
                  <span style={{ color: '#a78bfa', fontSize: '0.78rem', fontWeight: '600' }}>Submitted</span>
                </div>
              </div>

              <button style={modalStyles.doneBtn} onClick={() => navigate('/feed')}>
                Back to Feed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {modal?.type === 'error' && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <button style={modalStyles.closeBtn} onClick={() => setModal(null)}><X size={16} /></button>
            <div style={modalStyles.errorIcon}><XCircle size={32} color="#ef4444" /></div>
            <h3 style={modalStyles.title}>Submission Failed!</h3>
            <p style={modalStyles.message}>{modal.message}</p>
            <button style={modalStyles.errorBtn} onClick={() => setModal(null)}>Try Again</button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '540px', backdropFilter: 'blur(10px)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  title: { color: '#fff', fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.3rem' },
  subtitle: { color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' },
  closeBtn: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', display: 'flex' },
  infoBanner: { display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '12px', padding: '0.85rem 1rem', marginBottom: '1.75rem' },
  infoText: { color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: 0 },
  section: { marginBottom: '1.5rem' },
  label: { display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' },
  required: { color: '#f87171' },
  optional: { color: 'rgba(255,255,255,0.2)', textTransform: 'none', fontSize: '0.75rem' },
  selectBtn: { width: '100%', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' },
  dropdown: { position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', zIndex: 100, overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.5)' },
  dropdownItem: { padding: '0.75rem 1rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', cursor: 'pointer', background: 'transparent' },
  dropdownItemActive: { padding: '0.75rem 1rem', background: 'linear-gradient(90deg, rgba(167,139,250,0.2), rgba(96,165,250,0.2))', color: '#a78bfa', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '600' },
  textarea: { width: '100%', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.6 },
  charCount: { color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', textAlign: 'right', marginTop: '0.4rem' },
  footer: { display: 'flex', gap: '0.75rem', marginTop: '0.5rem' },
  cancelBtn: { flex: 1, padding: '0.85rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', borderRadius: '10px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600' },
  submitBtn: { flex: 2, padding: '0.85rem', background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', border: 'none', color: '#fff', borderRadius: '10px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '700' }
}

const modalStyles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  modal: { background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2.5rem 2rem', width: '100%', maxWidth: '380px', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' },
  closeBtn: { position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.5)', borderRadius: '6px', padding: '0.3rem', cursor: 'pointer', display: 'flex', zIndex: 2 },
  successIcon: { width: '80px', height: '80px', background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' },
  successTitle: { color: '#fff', fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.4rem' },
  successSub: { color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.75rem' },
  reportCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem', textAlign: 'left' },
  reportCardTitle: { color: '#fff', fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.2rem' },
  reportCardSub: { color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' },
  reportCardBadge: { display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '20px', padding: '0.3rem 0.75rem' },
  doneBtn: { width: '100%', padding: '0.85rem', background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', border: 'none', color: '#fff', borderRadius: '10px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '700' },
  errorIcon: { width: '64px', height: '64px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' },
  title: { color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.75rem' },
  message: { color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' },
  errorBtn: { width: '100%', padding: '0.75rem', background: 'linear-gradient(90deg, #ef4444, #dc2626)', border: 'none', color: '#fff', borderRadius: '10px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600' }
}

export default Report
