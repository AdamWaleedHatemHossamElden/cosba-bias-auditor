import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar, Shield, Edit3, Save, X,
  UploadCloud, Flag, Eye, Trash2, CheckCircle, XCircle
} from 'lucide-react'
import API from '../services/api'

function Profile() {
  const navigate = useNavigate()

  const [profileData, setProfileData] = useState(null)
  const [uploads, setUploads] = useState([])
  const [reports, setReports] = useState([])
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ username: '', email: '', password: '' })
  const [modal, setModal] = useState(null)
  const [activeTab, setActiveTab] = useState('uploads')

  const fetchAll = useCallback(async () => {
    try {
      const [profileRes, uploadsRes, reportsRes] = await Promise.all([
        API.get('/auth/me'),
        API.get('/content/my'),
        API.get('/reports/my')
      ])
      setProfileData(profileRes.data)
      setEditForm({ username: profileRes.data.username, email: profileRes.data.email, password: '' })
      setUploads(uploadsRes.data)
      setReports(reportsRes.data)
    } catch {
      navigate('/login')
    }
  }, [navigate])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      const payload = { username: editForm.username, email: editForm.email }
      if (editForm.password) payload.password = editForm.password
      await API.put('/auth/profile', payload)
      setModal({ type: 'success', title: 'Profile Updated!', message: 'Your profile has been updated successfully.' })
      setEditing(false)
      fetchAll()
    } catch (err) {
      setModal({ type: 'error', title: 'Update Failed!', message: err.response?.data?.message || 'Could not update profile.' })
    }
  }

  const handleDeleteUpload = async (id) => {
    try {
      await API.delete(`/content/${id}`)
      setUploads(prev => prev.filter(u => u.id !== id))
      setModal({ type: 'success', title: 'Deleted!', message: 'Your upload has been removed.' })
    } catch {
      setModal({ type: 'error', title: 'Failed!', message: 'Could not delete upload.' })
    }
  }

  const getInitials = (name) => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??'
  const getStatusStyle = (status = 'pending') => {
    const statusStyles = {
      pending: styles.statusPending,
      reviewed: styles.statusReviewed,
      resolved: styles.statusResolved,
      dismissed: styles.statusDismissed
    }
    return statusStyles[status] || styles.statusPending
  }

  const statCards = [
    { label: 'Uploads', value: uploads.length, icon: UploadCloud, color: '#a78bfa' },
    { label: 'Reports', value: reports.length, icon: Flag, color: '#60a5fa' },
    { label: 'Role', value: profileData?.role === 'admin' ? 'Admin' : 'User', icon: Shield, color: '#34d399' },
    { label: 'Member Since', value: profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—', icon: Calendar, color: '#fbbf24' }
  ]

  if (!profileData) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem' }}>Loading profile...</div>
    </div>
  )

  return (
    <div style={styles.page}>

      {/* Page Title */}
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Profile</h1>
        <p style={styles.pageSubtitle}>View and manage all your profile details here.</p>
      </div>

      {/* Top Row — Avatar Card + Bio Card */}
      <div style={styles.topRow}>

        {/* Avatar Card */}
        <div style={styles.avatarCard}>
          <div style={styles.avatarRing}>
            <div style={styles.avatarInner}>
              <span style={styles.avatarText}>{getInitials(profileData.username)}</span>
            </div>
            <div style={styles.onlineDot} />
          </div>
          <h2 style={styles.avatarName}>{profileData.username}</h2>
          <span style={styles.roleBadge}>{profileData.role === 'admin' ? '⚡ Admin' : '👤 User'}</span>
          <p style={styles.avatarEmail}>{profileData.email}</p>
          <button style={styles.editProfileBtn} onClick={() => setEditing(true)}>
            <Edit3 size={14} /> Edit Profile
          </button>
        </div>

        {/* Bio & Details Card */}
        <div style={styles.bioCard}>
          <div style={styles.bioHeader}>
            <h3 style={styles.bioTitle}>Bio & other details</h3>
            <div style={styles.activeDot} />
          </div>

          <div style={styles.bioGrid}>
            <div style={styles.bioItem}>
              <p style={styles.bioLabel}>Username</p>
              <p style={styles.bioValue}>{profileData.username}</p>
            </div>
            <div style={styles.bioItem}>
              <p style={styles.bioLabel}>Email</p>
              <p style={styles.bioValue}>{profileData.email}</p>
            </div>
            <div style={styles.bioItem}>
              <p style={styles.bioLabel}>Role</p>
              <p style={styles.bioValue}>{profileData.role === 'admin' ? 'Administrator' : 'Regular User'}</p>
            </div>
            <div style={styles.bioItem}>
              <p style={styles.bioLabel}>Account Status</p>
              <span style={styles.accountStatusBadge}>● Active</span>
            </div>
            <div style={styles.bioItem}>
              <p style={styles.bioLabel}>Total Uploads</p>
              <p style={styles.bioValue}>{uploads.length} items</p>
            </div>
            <div style={styles.bioItem}>
              <p style={styles.bioLabel}>Total Reports</p>
              <p style={styles.bioValue}>{reports.length} submitted</p>
            </div>
            <div style={styles.bioItem}>
              <p style={styles.bioLabel}>Member Since</p>
              <p style={styles.bioValue}>{new Date(profileData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div style={styles.bioItem}>
              <p style={styles.bioLabel}>Contribution</p>
              <span style={styles.contribBadge}>🏅 Bias Reporter</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        {statCards.map(({ label, value, icon: Icon, color }, i) => (
          <div key={i} style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: `${color}18`, border: `1px solid ${color}33` }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <p style={styles.statValue}>{value}</p>
              <p style={styles.statLabel}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={styles.tabsRow}>
        {['uploads', 'reports'].map(tab => (
          <button key={tab} style={activeTab === tab ? styles.activeTab : styles.tab} onClick={() => setActiveTab(tab)}>
            {tab === 'uploads' ? <UploadCloud size={14} /> : <Flag size={14} />}
            My {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span style={styles.tabCount}>{tab === 'uploads' ? uploads.length : reports.length}</span>
          </button>
        ))}
      </div>

      {/* Uploads Table */}
      {activeTab === 'uploads' && (
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Prompt</th>
                <th style={styles.th}>AI Model</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {uploads.length === 0 ? (
                <tr><td colSpan={6} style={styles.emptyCell}>No uploads yet. <span style={styles.emptyLink} onClick={() => navigate('/upload')}>Upload something!</span></td></tr>
              ) : uploads.map(u => (
                <tr key={u.id} style={styles.tr}>
                  <td style={styles.td}>{u.id}</td>
                  <td style={styles.td}><span style={styles.typeBadge}>{u.type}</span></td>
                  <td style={{ ...styles.td, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.prompt}</td>
                  <td style={styles.td}>{u.ai_model || '—'}</td>
                  <td style={styles.td}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button style={styles.viewBtn} onClick={() => navigate('/feed')} title="View"><Eye size={14} /></button>
                      <button style={styles.deleteBtn} onClick={() => handleDeleteUpload(u.id)} title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reports Table */}
      {activeTab === 'reports' && (
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Bias Category</th>
                <th style={styles.th}>Secondary</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr><td colSpan={6} style={styles.emptyCell}>No reports yet. <span style={styles.emptyLink} onClick={() => navigate('/feed')}>Report bias from feed!</span></td></tr>
              ) : reports.map(r => (
                <tr key={r.id} style={styles.tr}>
                  <td style={styles.td}>{r.id}</td>
                  <td style={styles.td}><span style={styles.biasBadge}>{r.bias_category}</span></td>
                  <td style={styles.td}>{r.secondary_category || '—'}</td>
                  <td style={styles.td}><span style={{ ...styles.statusBadge, ...getStatusStyle(r.status || 'pending') }}>{r.status || 'pending'}</span></td>
                  <td style={{ ...styles.td, maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</td>
                  <td style={styles.td}>{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <div style={modalStyles.modalHeader}>
              <h3 style={modalStyles.modalTitle}>Edit Profile</h3>
              <button style={modalStyles.closeBtn} onClick={() => setEditing(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div style={modalStyles.field}>
                <label style={modalStyles.label}>Username</label>
                <input style={modalStyles.input} value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} required />
              </div>
              <div style={modalStyles.field}>
                <label style={modalStyles.label}>Email</label>
                <input style={modalStyles.input} type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} required />
              </div>
              <div style={modalStyles.field}>
                <label style={modalStyles.label}>New Password <span style={{ color: 'rgba(255,255,255,0.2)', textTransform: 'none' }}>(leave blank to keep current)</span></label>
                <input style={modalStyles.input} type="password" placeholder="Enter new password..." value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })} />
              </div>
              <div style={modalStyles.btnRow}>
                <button type="button" style={modalStyles.cancelBtn} onClick={() => setEditing(false)}>Cancel</button>
                <button type="submit" style={modalStyles.saveBtn}><Save size={14} /> Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success / Error Modal */}
      {modal && (
        <div style={modalStyles.overlay}>
          <div style={{ ...modalStyles.modal, textAlign: 'center' }}>
            <button style={{ ...modalStyles.closeBtn, position: 'absolute', top: '1rem', right: '1rem' }} onClick={() => setModal(null)}><X size={16} /></button>
            <div style={modal.type === 'success' ? modalStyles.iconGreen : modalStyles.iconRed}>
              {modal.type === 'success' ? <CheckCircle size={32} color="#22c55e" /> : <XCircle size={32} color="#ef4444" />}
            </div>
            <h3 style={modalStyles.modalTitle}>{modal.title}</h3>
            <p style={modalStyles.modalMsg}>{modal.message}</p>
            <button style={modal.type === 'success' ? modalStyles.saveBtn : modalStyles.errorBtn} onClick={() => setModal(null)}>
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', color: '#fff', padding: '2.5rem' },
  pageHeader: { marginBottom: '2rem' },
  pageTitle: { fontSize: '2rem', fontWeight: '800', color: '#fff', marginBottom: '0.3rem' },
  pageSubtitle: { color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem' },
  topRow: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', marginBottom: '1.5rem' },

  // Avatar Card
  avatarCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  avatarRing: { position: 'relative', width: '120px', height: '120px', marginBottom: '1.25rem' },
  avatarInner: { width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(167,139,250,0.4)' },
  avatarText: { fontSize: '2.5rem', fontWeight: '800', color: '#fff' },
  onlineDot: { position: 'absolute', bottom: '6px', right: '6px', width: '16px', height: '16px', background: '#22c55e', border: '3px solid #1e1b4b', borderRadius: '50%' },
  avatarName: { color: '#fff', fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.4rem' },
  roleBadge: { background: 'linear-gradient(90deg, rgba(167,139,250,0.2), rgba(96,165,250,0.2))', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa', padding: '0.25rem 0.9rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.6rem', display: 'inline-block' },
  avatarEmail: { color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem', marginBottom: '1.5rem' },
  editProfileBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.5rem', background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', border: 'none', color: '#fff', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' },

  // Bio Card
  bioCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '2rem' },
  bioHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  bioTitle: { color: '#fff', fontSize: '1rem', fontWeight: '700' },
  activeDot: { width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px #22c55e' },
  bioGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' },
  bioItem: {},
  bioLabel: { color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' },
  bioValue: { color: '#fff', fontSize: '0.95rem', fontWeight: '500' },
  accountStatusBadge: { color: '#22c55e', fontSize: '0.88rem', fontWeight: '600' },
  contribBadge: { background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24', padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600' },

  // Stats
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' },
  statCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' },
  statIcon: { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statValue: { color: '#fff', fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.15rem' },
  statLabel: { color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' },

  // Tabs
  tabsRow: { display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' },
  tab: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' },
  activeTab: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' },
  tabCount: { background: 'rgba(255,255,255,0.2)', padding: '0.1rem 0.5rem', borderRadius: '10px', fontSize: '0.75rem' },

  // Table
  tableCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '0.75rem 1rem', textAlign: 'left', color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.04)' },
  td: { padding: '0.85rem 1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' },
  typeBadge: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.78rem' },
  biasBadge: { background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa', padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.78rem' },
  actions: { display: 'flex', gap: '0.5rem' },
  viewBtn: { padding: '0.4rem', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', color: '#60a5fa', borderRadius: '6px', cursor: 'pointer', display: 'flex' },
  deleteBtn: { padding: '0.4rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '6px', cursor: 'pointer', display: 'flex' },
  emptyCell: { padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' },
  emptyLink: { color: '#a78bfa', cursor: 'pointer', textDecoration: 'underline' },
  statusBadge: { display: 'inline-flex', padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700', textTransform: 'capitalize' },
  statusPending: { background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.28)', color: '#fbbf24' },
  statusReviewed: { background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.28)', color: '#60a5fa' },
  statusResolved: { background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.28)', color: '#34d399' },
  statusDismissed: { background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.28)', color: '#f87171' }
}

const modalStyles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  modal: { background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '420px', position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  modalTitle: { color: '#fff', fontSize: '1.1rem', fontWeight: '700' },
  closeBtn: { background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.5)', borderRadius: '6px', padding: '0.3rem', cursor: 'pointer', display: 'flex' },
  field: { marginBottom: '1.25rem' },
  label: { display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' },
  input: { width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' },
  btnRow: { display: 'flex', gap: '0.75rem', marginTop: '0.5rem' },
  cancelBtn: { flex: 1, padding: '0.8rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' },
  saveBtn: { flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.8rem', background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', border: 'none', color: '#fff', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '700' },
  iconGreen: { width: '64px', height: '64px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' },
  iconRed: { width: '64px', height: '64px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' },
  modalMsg: { color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' },
  errorBtn: { width: '100%', padding: '0.8rem', background: 'linear-gradient(90deg, #ef4444, #dc2626)', border: 'none', color: '#fff', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }
}

export default Profile
