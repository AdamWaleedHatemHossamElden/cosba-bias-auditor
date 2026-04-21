import { useState, useEffect } from 'react'
import { ArrowUpRight, Flag, FileText, Tag, Users } from 'lucide-react'
import API from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts'

const COLORS = ['#a78bfa', '#60a5fa', '#f472b6', '#34d399', '#fbbf24', '#f87171', '#818cf8']

function Dashboard() {
  const [reports, setReports] = useState([])
  const [metrics, setMetrics] = useState({
    prevalence: [],
    density: [],
    consensus: [],
    topPrompts: [],
    contentTypes: [],
    modelBreakdown: [],
    timeline: [],
    statusBreakdown: []
  })

  useEffect(() => {
    const fetchData = async () => {
      const [reportsRes, metricsRes] = await Promise.all([
        API.get('/reports'),
        API.get('/reports/metrics')
      ])
      setReports(reportsRes.data)
      setMetrics(metricsRes.data)
    }
    fetchData()
  }, [])

  const statCards = [
    { label: 'Total Reports', value: reports.length, icon: Flag, accent: true, sub: 'All time submissions' },
    { label: 'Flagged Content', value: metrics.density.length, icon: FileText, sub: 'Unique items flagged' },
    { label: 'Bias Categories', value: metrics.prevalence.length, icon: Tag, sub: 'Distinct bias types found' },
    { label: 'Resolved Reports', value: reports.filter(r => r.status === 'resolved').length, icon: Users, sub: 'Completed reviews' }
  ]

  const getStatusStyle = (status = 'pending') => {
    const statusStyles = {
      pending: styles.statusPending,
      reviewed: styles.statusReviewed,
      resolved: styles.statusResolved,
      dismissed: styles.statusDismissed
    }
    return statusStyles[status] || styles.statusPending
  }

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Dashboard</h2>
          <p style={styles.subtitle}>Analyze and explore AI bias patterns from the community</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={styles.statsGrid}>
        {statCards.map(({ label, value, icon: Icon, accent, sub }, i) => (
          <div key={i} style={accent ? { ...styles.statCard, ...styles.statCardAccent } : styles.statCard}>
            <div style={styles.statTop}>
              <div style={accent ? styles.statIconAccent : styles.statIcon}>
                <Icon size={18} color={accent ? '#fff' : '#a78bfa'} />
              </div>
              <ArrowUpRight size={16} color={accent ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'} />
            </div>
            <h3 style={accent ? styles.statNumAccent : styles.statNum}>{value}</h3>
            <p style={accent ? styles.statLabelAccent : styles.statLabel}>{label}</p>
            <p style={accent ? styles.statSubAccent : styles.statSub}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={styles.chartsRow}>
        {/* Bar Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Bias Prevalence</h3>
            <span style={styles.chartBadge}>By Category</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={metrics.prevalence} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="bias_category" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {metrics.prevalence.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Category Distribution</h3>
            <span style={styles.chartBadge}>All Time</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={metrics.prevalence} dataKey="count" nameKey="bias_category" cx="50%" cy="50%" outerRadius={90} innerRadius={45}>
                {metrics.prevalence.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }} />
              <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Flagged */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Top Flagged Prompts</h3>
            <span style={styles.chartBadge}>Most Reported</span>
          </div>
          <div style={styles.topList}>
            {metrics.topPrompts?.slice(0, 5).map((p, i) => (
              <div key={i} style={styles.topItem}>
                <div style={styles.topRank}>{i + 1}</div>
                <div style={styles.topInfo}>
                  <p style={styles.topPrompt}>{p.prompt}</p>
                  <p style={styles.topModel}>{p.ai_model || 'Unknown model'}</p>
                </div>
                <div style={styles.topCount}>{p.flag_count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insight Row */}
      <div style={styles.insightRow}>
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Reports Over Time</h3>
            <span style={styles.chartBadge}>Recent Activity</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={metrics.timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="report_date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }} />
              <Line type="monotone" dataKey="count" stroke="#60a5fa" strokeWidth={3} dot={{ fill: '#a78bfa', strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Reports by AI Model</h3>
            <span style={styles.chartBadge}>Top Models</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={metrics.modelBreakdown} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="ai_model" width={90} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} fill="#a78bfa" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Report Status</h3>
            <span style={styles.chartBadge}>Review Flow</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={metrics.statusBreakdown} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={82}>
                {metrics.statusBreakdown.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }} />
              <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reports Table */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h3 style={styles.chartTitle}>All Reports</h3>
          <span style={styles.chartBadge}>{reports.length} total</span>
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>User</th>
              <th style={styles.th}>Primary Bias</th>
              <th style={styles.th}>Secondary Bias</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Prompt</th>
              <th style={styles.th}>Date</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} style={styles.tr}>
                <td style={styles.td}>{r.id}</td>
                <td style={styles.td}>{r.username}</td>
                <td style={styles.td}><span style={styles.badge}>{r.bias_category}</span></td>
                <td style={styles.td}>{r.secondary_category || '—'}</td>
                <td style={styles.td}><span style={{ ...styles.statusBadge, ...getStatusStyle(r.status || 'pending') }}>{r.status || 'pending'}</span></td>
                <td style={{ ...styles.td, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.prompt}</td>
                <td style={styles.td}>{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', color: '#fff', padding: '2.5rem 2.5rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' },
  title: { fontSize: '2rem', fontWeight: '800', color: '#fff', marginBottom: '0.3rem' },
  subtitle: { color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' },
  statCard: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem', backdropFilter: 'blur(10px)' },
  statCardAccent: { background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', border: 'none' },
  statTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  statIcon: { width: '36px', height: '36px', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statIconAccent: { width: '36px', height: '36px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statNum: { fontSize: '2.2rem', fontWeight: '800', color: '#fff', marginBottom: '0.25rem' },
  statNumAccent: { fontSize: '2.2rem', fontWeight: '800', color: '#fff', marginBottom: '0.25rem' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.2rem' },
  statLabelAccent: { color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.2rem' },
  statSub: { color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' },
  statSubAccent: { color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem' },
  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' },
  insightRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' },
  chartCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem' },
  chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  chartTitle: { color: '#fff', fontSize: '1rem', fontWeight: '600' },
  chartBadge: { background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa', padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem' },
  topList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  topItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' },
  topRank: { width: '24px', height: '24px', background: 'rgba(167,139,250,0.2)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', color: '#a78bfa', flexShrink: 0 },
  topInfo: { flex: 1, overflow: 'hidden' },
  topPrompt: { color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 },
  topModel: { color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', margin: 0 },
  topCount: { background: 'rgba(96,165,250,0.15)', color: '#60a5fa', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', flexShrink: 0 },
  tableCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem', overflowX: 'auto' },
  tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '0.75rem 1rem', textAlign: 'left', color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.04)' },
  td: { padding: '0.85rem 1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' },
  badge: { background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa', padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.78rem' },
  statusBadge: { display: 'inline-flex', padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700', textTransform: 'capitalize' },
  statusPending: { background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.28)', color: '#fbbf24' },
  statusReviewed: { background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.28)', color: '#60a5fa' },
  statusResolved: { background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.28)', color: '#34d399' },
  statusDismissed: { background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.28)', color: '#f87171' }
}

export default Dashboard
