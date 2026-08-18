import { useNavigate } from 'react-router-dom'
import { ArrowRight, Flag, BarChart2, Upload, Users, Shield, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const features = [
    { icon: Upload, title: 'Upload Content', desc: 'Submit AI-generated images or text with the prompt that created them.', path: '/upload' },
    { icon: Flag, title: 'Flag Bias', desc: 'Identify and categorize biases like gender stereotyping, racial bias, and more.', path: '/feed' },
    { icon: BarChart2, title: 'Analyze Patterns', desc: 'Explore aggregated bias data through the public community dashboard.', path: '/dashboard' },
    { icon: Users, title: 'Community Driven', desc: 'Contribute evidence and discussion toward a better understanding of AI bias.', path: '/feed' },
    { icon: Shield, title: 'Role-aware Access', desc: 'Authenticated reporting and administrator-only moderation actions.', path: user ? '/profile' : '/register' },
    { icon: Zap, title: 'Current Insights', desc: 'View metrics and charts generated from submitted community reports.', path: '/dashboard' }
  ]

  return (
    <div style={styles.page}>

      {/* Hero Section */}
      <div style={styles.hero}>
        {/* Left */}
        <div style={styles.heroLeft}>
          <div style={styles.heroBadge}>AI Bias Detection Platform</div>
          <h1 style={styles.heroTitle}>
            Crowd-Sourced<br />
            <span style={styles.heroHighlight}>Bias Auditor</span>
          </h1>
          <div style={styles.heroDivider} />
          <div style={styles.heroActions}>
            <button style={styles.primaryBtn} onClick={() => navigate('/feed')}>
              Browse Content <ArrowRight size={16} />
            </button>
            <button style={styles.outlineBtn} onClick={() => navigate(user ? '/upload' : '/register')}>
              {user ? 'Upload Content' : 'Join Community'}
            </button>
          </div>
        </div>

        {/* Right */}
        <div style={styles.heroRight}>
          <p style={styles.heroDesc}>
            Help identify, flag, and analyze biases in AI-generated content.
            Our platform empowers communities to hold AI systems accountable
            and build a more equitable digital future.
          </p>

          {/* Mini Stats */}
          <div style={styles.miniStats}>
            <div style={styles.miniStat}>
              <span style={styles.miniStatNum}>7+</span>
              <span style={styles.miniStatLabel}>Bias Categories</span>
            </div>
            <div style={styles.miniStatDivider} />
            <div style={styles.miniStat}>
              <span style={styles.miniStatNum}>Public</span>
              <span style={styles.miniStatLabel}>Browse & Analytics</span>
            </div>
            <div style={styles.miniStatDivider} />
            <div style={styles.miniStat}>
              <span style={styles.miniStatNum}>Live</span>
              <span style={styles.miniStatLabel}>Dashboard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.sectionDivider}>
        <span style={styles.sectionLabel}>Explore all features</span>
      </div>

      {/* Features Grid */}
      <div style={styles.featuresGrid}>
        {features.map(({ icon: Icon, title, desc, path }, i) => (
          <div key={i} style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <Icon size={20} color="#a78bfa" />
            </div>
            <h4 style={styles.featureTitle}>{title}</h4>
            <p style={styles.featureDesc}>{desc}</p>
            <button style={styles.featureLink} onClick={() => navigate(path)}>
              Learn more <ArrowRight size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* CTA Banner */}
      <div style={styles.ctaBanner}>
        <div>
          <h3 style={styles.ctaTitle}>Ready to contribute?</h3>
          <p style={styles.ctaDesc}>{user ? 'Upload content, review reports, and help make AI fairer for everyone.' : 'Join the community and help make AI fairer for everyone.'}</p>
        </div>
        <button style={styles.ctaBtn} onClick={() => navigate(user ? '/upload' : '/register')}>
          {user ? 'Start Uploading' : 'Get Started'} <ArrowRight size={16} />
        </button>
      </div>

    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    color: '#fff',
    padding: '4rem 3rem'
  },

  // Hero
  hero: { display: 'flex', gap: '4rem', alignItems: 'flex-start', maxWidth: '1100px', margin: '0 auto 5rem auto' },
  heroLeft: { flex: 1.2 },
  heroBadge: { display: 'inline-block', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa', padding: '0.35rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.05em', marginBottom: '1.5rem', textTransform: 'uppercase' },
  heroTitle: { fontSize: '4rem', fontWeight: '900', lineHeight: 1.1, color: '#fff', marginBottom: '2rem' },
  heroHighlight: { background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroDivider: { width: '60px', height: '4px', background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', borderRadius: '2px', marginBottom: '2.5rem' },
  heroActions: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  primaryBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.9rem 2rem', background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  outlineBtn: { padding: '0.9rem 2rem', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },

  heroRight: { flex: 1, paddingTop: '1rem' },
  heroDesc: { color: 'rgba(255,255,255,0.6)', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '2.5rem' },
  miniStats: { display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem 1.5rem' },
  miniStat: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  miniStatNum: { fontSize: '1.5rem', fontWeight: '800', background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  miniStatLabel: { color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' },
  miniStatDivider: { width: '1px', height: '40px', background: 'rgba(255,255,255,0.08)' },

  // Section
  sectionDivider: { display: 'flex', alignItems: 'center', gap: '1rem', maxWidth: '1100px', margin: '0 auto 3rem auto' },
  sectionLabel: { color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' },

  // Features
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', maxWidth: '1100px', margin: '0 auto 4rem auto' },
  featureCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.75rem' },
  featureIcon: { width: '42px', height: '42px', background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' },
  featureTitle: { color: '#fff', fontSize: '1rem', fontWeight: '700', marginBottom: '0.6rem' },
  featureDesc: { color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1.25rem' },
  featureLink: { display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: '#a78bfa', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', padding: 0 },

  // CTA Banner
  ctaBanner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(90deg, rgba(167,139,250,0.15), rgba(96,165,250,0.15))', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '16px', padding: '2rem 2.5rem', maxWidth: '1100px', margin: '0 auto' },
  ctaTitle: { color: '#fff', fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.4rem' },
  ctaDesc: { color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' },
  ctaBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 2rem', background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }
}

export default Home
