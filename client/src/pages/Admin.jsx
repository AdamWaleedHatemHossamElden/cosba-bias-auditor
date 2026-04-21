import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, FileText, Flag, Shield, Trash2, ArrowUpRight, UserCheck, CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react'
import API from '../services/api'
import { useAuth } from '../context/AuthContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#a78bfa', '#60a5fa', '#f472b6', '#34d399', '#fbbf24', '#f87171', '#818cf8']
const REPORT_STATUSES = ['pending', 'reviewed', 'resolved', 'dismissed']

// ConfirmModal Component
function ConfirmModal({ type = 'confirm', title, message, onConfirm, onCancel }) {
  const isConfirm = type === 'confirm'
  const isSuccess = type === 'success'
  const isError = type === 'error'

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <button style={modalStyles.closeBtn} onClick={onCancel}>
          <X size={16} />
        </button>
        <div style={isSuccess ? modalStyles.iconWrapGreen : isError ? modalStyles.iconWrapRed : modalStyles.iconWrapPurple}>
          {isSuccess && <CheckCircle size={32} color="#22c55e" />}
          {isError && <XCircle size={32} color="#ef4444" />}
          {isConfirm && <AlertTriangle size={32} color="#a78bfa" />}
        </div>
        <h3 style={modalStyles.title}>{title}</h3>
        <p style={modalStyles.message}>{message}</p>
        <div style={modalStyles.btnRow}>
          {isConfirm && (
            <>
              <button style={modalStyles.cancelBtn} onClick={onCancel}>Cancel</button>
              <button style={modalStyles.confirmBtn} onClick={onConfirm}>Confirm</button>
            </>
          )}
          {isSuccess && <button style={modalStyles.successBtn} onClick={onCancel}>Close</button>}
          {isError && <button style={modalStyles.errorBtn} onClick={onCancel}>Try Again</button>}
        </div>
      </div>
    </div>
  )
}

const modalStyles = {
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

function Admin() {
  const [users, setUsers] = useState([])
  const [contents, setContents] = useState([])
  const [reports, setReports] = useState([])
  const [activeTab, setActiveTab] = useState('users')
  const [newAdmin, setNewAdmin] = useState({ username: '', email: '', password: '' })
  const [modal, setModal] = useState(null)
  const [metrics, setMetrics] = useState({ prevalence: [] })
  const { user } = useAuth()
  const navigate = useNavigate()

  const fetchData = useCallback(async () => {
    const [usersRes, contentsRes, reportsRes, metricsRes] = await Promise.all([
      API.get('/admin/users'),
      API.get('/content'),
      API.get('/reports'),
      API.get('/reports/metrics')
    ])
    setUsers(usersRes.data)
    setContents(contentsRes.data)
    setReports(reportsRes.data)
    setMetrics(metricsRes.data)
  }, [])

  useEffect(() => {
    if (user?.role !== 'admin') navigate('/')
    fetchData()
  }, [fetchData, navigate, user?.role])

  const confirm = (title, message, onConfirm) => {
    setModal({ type: 'confirm', title, message, onConfirm })
  }

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    try {
      await API.post('/admin/create-admin', newAdmin)
      setNewAdmin({ username: '', email: '', password: '' })
      setModal({ type: 'success', title: 'Admin Created!', message: 'New admin account has been created successfully.' })
      fetchData()
    } catch (err) {
      setModal({ type: 'error', title: 'Something Went Wrong!', message: err.response?.data?.message || 'Could not create admin.' })
    }
  }

  const handleMakeAdmin = (id) => {
    confirm('Promote User', 'Are you sure you want to promote this user to admin?', async () => {
      try {
        await API.put(`/admin/users/${id}/make-admin`)
        setModal({ type: 'success', title: 'User Promoted!', message: 'The user has been granted admin access.' })
        fetchData()
      } catch {
        setModal({ type: 'error', title: 'Something Went Wrong!', message: 'Could not promote user. Please try again.' })
      }
    })
  }

  const handleDeleteUser = (id) => {
    confirm('Delete User', 'Are you sure you want to delete this user? This action cannot be undone.', async () => {
      try {
        await API.delete(`/admin/users/${id}`)
        setModal({ type: 'success', title: 'User Deleted!', message: 'The user has been removed successfully.' })
        fetchData()
      } catch {
        setModal({ type: 'error', title: 'Something Went Wrong!', message: 'Could not delete user. Please try again.' })
      }
    })
  }

  const handleDeleteContent = (id) => {
    confirm('Delete Content', 'Are you sure you want to delete this content item?', async () => {
      try {
        await API.delete(`/admin/content/${id}`)
        setContents(contents.filter(c => c.id !== id))
        setModal({ type: 'success', title: 'Content Deleted!', message: 'The content has been removed successfully.' })
      } catch {
        setModal({ type: 'error', title: 'Something Went Wrong!', message: 'Could not delete content. Please try again.' })
      }
    })
  }

  const handleDeleteReport = (id) => {
    confirm('Delete Report', 'Are you sure you want to delete this report?', async () => {
      try {
        await API.delete(`/admin/report/${id}`)
        setReports(reports.filter(r => r.id !== id))
        setModal({ type: 'success', title: 'Report Deleted!', message: 'The report has been removed successfully.' })
      } catch {
        setModal({ type: 'error', title: 'Something Went Wrong!', message: 'Could not delete report. Please try again.' })
      }
    })
  }

  const handleUpdateReportStatus = async (id, status) => {
    try {
      await API.put(`/admin/report/${id}/status`, { status })
      setReports(prev => prev.map(report => (
        report.id === id ? { ...report, status } : report
      )))
    } catch {
      setModal({ type: 'error', title: 'Something Went Wrong!', message: 'Could not update report status. Please try again.' })
    }
  }

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
    { label: 'Total Users', value: users.length, icon: Users, sub: 'Registered accounts' },
    { label: 'Total Content', value: contents.length, icon: FileText, sub: 'Uploaded items', accent: true },
    { label: 'Total Reports', value: reports.length, icon: Flag, sub: 'Bias flags submitted' },
    { label: 'Pending Reports', value: reports.filter(r => (r.status || 'pending') === 'pending').length, icon: Shield, sub: 'Awaiting review' }
  ]

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Admin Panel</h2>
          <p style={styles.subtitle}>Manage users, content and reports</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={styles.statsGrid}>
        {statCards.map(({ label, value, icon: Icon, sub, accent }, i) => (
          <div key={i} style={accent ? { ...styles.statCard, ...styles.statCardAccent } : styles.statCard}>
            <div style={styles.statTop}>
              <div style={accent ? styles.statIconAccent : styles.statIcon}>
                <Icon size={16} color={accent ? '#fff' : '#a78bfa'} />
              </div>
              <ArrowUpRight size={14} color="rgba(255,255,255,0.2)" />
            </div>
            <h3 style={styles.statNum}>{value}</h3>
            <p style={styles.statLabel}>{label}</p>
            <p style={styles.statSub}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Middle Row */}
      <div style={styles.midRow}>
        {/* Chart */}
        <div style={styles.chartCard}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Bias Reports by Category</h3>
            <span style={styles.badge}>{reports.length} total</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={metrics.prevalence} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="bias_category" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {metrics.prevalence.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Create Admin Form */}
        <div style={styles.formCard}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Create Admin Account</h3>
          </div>
          <form onSubmit={handleCreateAdmin} style={styles.form}>
            <label style={styles.label}>Username</label>
            <input style={styles.input} type="text" placeholder="Enter username" value={newAdmin.username} onChange={e => setNewAdmin({ ...newAdmin, username: e.target.value })} required />
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" placeholder="Enter email" value={newAdmin.email} onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })} required />
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" placeholder="Enter password" value={newAdmin.password} onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })} required />
            <button type="submit" style={styles.createBtn}>Create Admin</button>
          </form>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsRow}>
        {['users', 'content', 'reports'].map(tab => (
          <button key={tab} style={activeTab === tab ? styles.activeTab : styles.tab} onClick={() => setActiveTab(tab)}>
            {tab === 'users' ? <Users size={14} /> : tab === 'content' ? <FileText size={14} /> : <Flag size={14} />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span style={styles.tabCount}>
              {tab === 'users' ? users.length : tab === 'content' ? contents.length : reports.length}
            </span>
          </button>
        ))}
      </div>

      {/* Users Table */}
      {activeTab === 'users' && (
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Username</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Joined</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={styles.tr}>
                  <td style={styles.td}>{u.id}</td>
                  <td style={styles.td}>
                    <div style={styles.userCell}>
                      <div style={styles.avatar}>{u.username?.[0]?.toUpperCase()}</div>
                      {u.username}
                    </div>
                  </td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>
                    <span style={u.role === 'admin' ? styles.badgeAdmin : styles.badgeUser}>{u.role}</span>
                  </td>
                  <td style={styles.td}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      {u.role !== 'admin' && (
                        <button style={styles.promoteBtn} onClick={() => handleMakeAdmin(u.id)} title="Make Admin">
                          <UserCheck size={14} />
                        </button>
                      )}
                      <button style={styles.deleteBtn} onClick={() => handleDeleteUser(u.id)} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Content Table */}
      {activeTab === 'content' && (
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Prompt</th>
                <th style={styles.th}>Model</th>
                <th style={styles.th}>By</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {contents.map(c => (
                <tr key={c.id} style={styles.tr}>
                  <td style={styles.td}>{c.id}</td>
                  <td style={styles.td}><span style={styles.badgeUser}>{c.type}</span></td>
                  <td style={{ ...styles.td, maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.prompt}</td>
                  <td style={styles.td}>{c.ai_model || '—'}</td>
                  <td style={styles.td}>{c.username}</td>
                  <td style={styles.td}>
                    <button style={styles.deleteBtn} onClick={() => handleDeleteContent(c.id)}><Trash2 size={14} /></button>
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
                <th style={styles.th}>User</th>
                <th style={styles.th}>Bias Category</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id} style={styles.tr}>
                  <td style={styles.td}>{r.id}</td>
                  <td style={styles.td}>
                    <div style={styles.userCell}>
                      <div style={styles.avatar}>{r.username?.[0]?.toUpperCase()}</div>
                      {r.username}
                    </div>
                  </td>
                  <td style={styles.td}><span style={styles.badgeAdmin}>{r.bias_category}</span></td>
                  <td style={{ ...styles.td, maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</td>
                  <td style={styles.td}>
                    <select
                      style={{ ...styles.statusSelect, ...getStatusStyle(r.status || 'pending') }}
                      value={r.status || 'pending'}
                      onChange={e => handleUpdateReportStatus(r.id, e.target.value)}
                    >
                      {REPORT_STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.deleteBtn} onClick={() => handleDeleteReport(r.id)}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <ConfirmModal
          type={modal.type}
          title={modal.title}
          message={modal.message}
          onConfirm={() => { modal.onConfirm?.(); setModal(null) }}
          onCancel={() => setModal(null)}
        />
      )}

    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', color: '#fff', padding: '2.5rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { fontSize: '2rem', fontWeight: '800', color: '#fff', marginBottom: '0.3rem' },
  subtitle: { color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' },
  statCard: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem' },
  statCardAccent: { background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', border: 'none' },
  statTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  statIcon: { width: '34px', height: '34px', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statIconAccent: { width: '34px', height: '34px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statNum: { fontSize: '2rem', fontWeight: '800', color: '#fff', marginBottom: '0.2rem' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.2rem' },
  statSub: { color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' },
  midRow: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' },
  chartCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem' },
  formCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  cardTitle: { color: '#fff', fontSize: '1rem', fontWeight: '600' },
  badge: { background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa', padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  label: { color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: { padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', outline: 'none' },
  createBtn: { padding: '0.75rem', background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600', marginTop: '0.5rem' },
  tabsRow: { display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' },
  tab: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' },
  activeTab: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' },
  tabCount: { background: 'rgba(255,255,255,0.2)', padding: '0.1rem 0.5rem', borderRadius: '10px', fontSize: '0.75rem' },
  tableCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '0.75rem 1rem', textAlign: 'left', color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.04)' },
  td: { padding: '0.85rem 1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' },
  userCell: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  avatar: { width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', color: '#fff', flexShrink: 0 },
  badgeAdmin: { background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa', padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.78rem' },
  badgeUser: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.78rem' },
  actions: { display: 'flex', gap: '0.5rem' },
  promoteBtn: { padding: '0.4rem', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  deleteBtn: { padding: '0.4rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  statusSelect: { minWidth: '112px', padding: '0.35rem 0.55rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: '700', textTransform: 'capitalize', outline: 'none', cursor: 'pointer' },
  statusPending: { background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.28)', color: '#fbbf24' },
  statusReviewed: { background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.28)', color: '#60a5fa' },
  statusResolved: { background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.28)', color: '#34d399' },
  statusDismissed: { background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.28)', color: '#f87171' }
}

export default Admin
