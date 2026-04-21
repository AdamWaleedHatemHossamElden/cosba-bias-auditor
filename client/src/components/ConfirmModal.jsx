import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react'

function ConfirmModal({ type = 'confirm', title, message, onConfirm, onCancel }) {
  const isConfirm = type === 'confirm'
  const isSuccess = type === 'success'
  const isError = type === 'error'

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Close */}
        <button style={styles.closeBtn} onClick={onCancel}>
          <X size={16} />
        </button>

        {/* Icon */}
        <div style={isSuccess ? styles.iconWrapGreen : isError ? styles.iconWrapRed : styles.iconWrapPurple}>
          {isSuccess && <CheckCircle size={32} color="#22c55e" />}
          {isError && <XCircle size={32} color="#ef4444" />}
          {isConfirm && <AlertTriangle size={32} color="#a78bfa" />}
        </div>

        {/* Text */}
        <h3 style={styles.title}>{title}</h3>
        <p style={styles.message}>{message}</p>

        {/* Buttons */}
        <div style={styles.btnRow}>
          {isConfirm && (
            <>
              <button style={styles.cancelBtn} onClick={onCancel}>Cancel</button>
              <button style={styles.confirmBtn} onClick={onConfirm}>Confirm</button>
            </>
          )}
          {isSuccess && (
            <button style={styles.successBtn} onClick={onCancel}>Close</button>
          )}
          {isError && (
            <button style={styles.errorBtn} onClick={onCancel}>Try Again</button>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  modal: { background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2.5rem 2rem', width: '100%', maxWidth: '380px', textAlign: 'center', position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' },
  closeBtn: { position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.5)', borderRadius: '6px', padding: '0.3rem', cursor: 'pointer', display: 'flex' },
  iconWrapGreen: { width: '64px', height: '64px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' },
  iconWrapRed: { width: '64px', height: '64px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' },
  iconWrapPurple: { width: '64px', height: '64px', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' },
  title: { color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.75rem' },
  message: { color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' },
  btnRow: { display: 'flex', gap: '0.75rem' },
  cancelBtn: { flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', borderRadius: '10px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600' },
  confirmBtn: { flex: 1, padding: '0.75rem', background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', border: 'none', color: '#fff', borderRadius: '10px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600' },
  successBtn: { flex: 1, padding: '0.75rem', background: 'linear-gradient(90deg, #22c55e, #16a34a)', border: 'none', color: '#fff', borderRadius: '10px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600' },
  errorBtn: { flex: 1, padding: '0.75rem', background: 'linear-gradient(90deg, #ef4444, #dc2626)', border: 'none', color: '#fff', borderRadius: '10px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600' }
}

export default ConfirmModal