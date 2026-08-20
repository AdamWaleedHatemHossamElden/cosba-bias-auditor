import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../services/api'
import { getUploadUrl } from '../services/uploads'
import { Check, Edit3, Eye, FileText, MessageCircle, Flag, RefreshCcw, Heart, Search, SlidersHorizontal, Trash2, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Feed() {
  const [contents, setContents] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentInputs, setCommentInputs] = useState({})
  const [likes, setLikes] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [modelFilter, setModelFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')
  const [editingComment, setEditingComment] = useState(null)
  const [editCommentText, setEditCommentText] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()

  const fetchAll = async () => {
    setLoading(true)
    try {
      const res = await API.get('/content')
      const data = res.data

      const withExtras = await Promise.all(
        data.map(async item => {
          let comments = []
          let likesData = { count: 0, userLiked: false }
          try {
            const cRes = await API.get(`/comments/${item.id}`)
            comments = cRes.data
          } catch {
            comments = []
          }
          try {
            const lRes = await API.get(`/likes/${item.id}`)
            likesData = lRes.data
          } catch {
            likesData = { count: 0, userLiked: false }
          }
          return { ...item, comments, likesData }
        })
      )

      setContents(withExtras)
      setLikes(Object.fromEntries(withExtras.map(item => [item.id, item.likesData])))
    } catch (err) {
      console.error('Failed to load content', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const handleAddComment = async (e, contentId) => {
    e.preventDefault()
    const text = commentInputs[contentId]?.trim()
    if (!text) return
    try {
      await API.post('/comments', { content_id: contentId, text })
      const res = await API.get(`/comments/${contentId}`)
      setContents(prev =>
        prev.map(c => (c.id === contentId ? { ...c, comments: res.data } : c))
      )
      setCommentInputs(prev => ({ ...prev, [contentId]: '' }))
    } catch (err) {
      console.error('Failed to add comment', err)
    }
  }

  const handleLike = async (contentId) => {
    try {
      await API.post('/likes', { content_id: contentId })
      const wasLiked = likes[contentId]?.userLiked
      setLikes(prev => ({
        ...prev,
        [contentId]: {
          count: wasLiked ? prev[contentId].count - 1 : prev[contentId].count + 1,
          userLiked: !wasLiked
        }
      }))
    } catch (err) {
      console.error('Failed to like', err)
    }
  }

  const refreshComments = async (contentId) => {
    const res = await API.get(`/comments/${contentId}`)
    setContents(prev =>
      prev.map(c => (c.id === contentId ? { ...c, comments: res.data } : c))
    )
  }

  const startEditComment = (comment) => {
    setEditingComment(comment.id)
    setEditCommentText(comment.text)
  }

  const cancelEditComment = () => {
    setEditingComment(null)
    setEditCommentText('')
  }

  const handleUpdateComment = async (contentId, commentId) => {
    const text = editCommentText.trim()
    if (!text) return

    try {
      await API.put(`/comments/${commentId}`, { text })
      await refreshComments(contentId)
      cancelEditComment()
    } catch (err) {
      console.error('Failed to update comment', err)
    }
  }

  const handleDeleteComment = async (contentId, commentId) => {
    try {
      await API.delete(`/comments/${commentId}`)
      await refreshComments(contentId)
    } catch (err) {
      console.error('Failed to delete comment', err)
    }
  }

  const modelOptions = Array.from(
    new Set(contents.map(item => item.ai_model).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b))

  const filteredContents = contents
    .filter(item => {
      const query = searchTerm.trim().toLowerCase()
      const matchesSearch =
        !query ||
        item.prompt?.toLowerCase().includes(query) ||
        item.text_content?.toLowerCase().includes(query) ||
        item.ai_model?.toLowerCase().includes(query) ||
        item.username?.toLowerCase().includes(query)
      const matchesType = typeFilter === 'all' || item.type === typeFilter
      const matchesModel = modelFilter === 'all' || item.ai_model === modelFilter

      return matchesSearch && matchesType && matchesModel
    })
    .sort((a, b) => {
      const aTime = new Date(a.created_at).getTime()
      const bTime = new Date(b.created_at).getTime()
      return sortOrder === 'oldest' ? aTime - bTime : bTime - aTime
    })

  const resetFilters = () => {
    setSearchTerm('')
    setTypeFilter('all')
    setModelFilter('all')
    setSortOrder('newest')
  }

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Feed</h2>
          <p style={styles.subtitle}>Browse and discuss AI-generated content from the community</p>
        </div>
        <button style={styles.refreshBtn} onClick={fetchAll}>
          <RefreshCcw size={14} /> Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={styles.loading}>Loading feed...</div>
      )}

      {/* Empty */}
      {!loading && contents.length === 0 && (
        <div style={styles.empty}>
          <p>No content yet.</p>
          <button style={styles.primaryBtn} onClick={() => navigate('/upload')}>
            Upload first content
          </button>
        </div>
      )}

      {!loading && contents.length > 0 && (
        <div style={styles.filters}>
          <div style={styles.searchWrap}>
            <Search size={16} color="rgba(255,255,255,0.35)" />
            <input
              style={styles.searchInput}
              placeholder="Search by prompt, text, model, or author..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={styles.filterGroup}>
            <SlidersHorizontal size={16} color="rgba(255,255,255,0.35)" />
            <select style={styles.select} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="all">All types</option>
              <option value="text">Text</option>
              <option value="image">Image</option>
            </select>
            <select style={styles.select} value={modelFilter} onChange={e => setModelFilter(e.target.value)}>
              <option value="all">All models</option>
              {modelOptions.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
            <select style={styles.select} value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>
      )}

      {!loading && contents.length > 0 && filteredContents.length === 0 && (
        <div style={styles.empty}>
          <p>No content matches your filters.</p>
          <button style={styles.primaryBtn} onClick={resetFilters}>
            Clear filters
          </button>
        </div>
      )}

      {/* Feed */}
      {!loading && filteredContents.length > 0 && (
        <div style={styles.feed}>
          {filteredContents.map(item => (
            <div key={item.id} style={styles.card}>

              {/* Card Header */}
              <div style={styles.cardHeader}>
                <div style={styles.cardHeaderLeft}>
                  <div style={styles.userAvatar}>
                    {item.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p style={styles.cardUsername}>{item.username}</p>
                    <p style={styles.cardDate}>
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <span style={styles.badge}>{item.type}</span>
              </div>

              {/* Image content */}
              {item.type === 'image' && item.file_path && (
                <img
                  src={getUploadUrl(item.file_path)}
                  alt="AI content"
                  style={styles.image}
                />
              )}

              {/* Text content */}
              {item.type === 'text' && (
                <div style={styles.textContent}>{item.text_content}</div>
              )}

              {item.type === 'file' && item.file_path && (
                <a
                  href={getUploadUrl(item.file_path)}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.fileContent}
                >
                  <FileText size={22} color="#a78bfa" />
                  <span>{item.file_path}</span>
                </a>
              )}

              {/* Prompt + model */}
              <div style={styles.infoRow}>
                <p style={styles.infoItem}>
                  <span style={styles.infoLabel}>Prompt:</span> {item.prompt}
                </p>
                <p style={styles.infoItem}>
                  <span style={styles.infoLabel}>Model:</span> {item.ai_model || 'Unknown'}
                </p>
              </div>

              {/* Actions Row */}
              <div style={styles.actionsRow}>

                {/* Like button */}
                <button
                  style={{
                    ...styles.actionBtn,
                    ...(likes[item.id]?.userLiked ? styles.likedBtn : {})
                  }}
                  onClick={() => handleLike(item.id)}
                >
                  <Heart
                    size={14}
                    fill={likes[item.id]?.userLiked ? '#f87171' : 'none'}
                    color={likes[item.id]?.userLiked ? '#f87171' : 'rgba(255,255,255,0.6)'}
                  />
                  {likes[item.id]?.count || 0} likes
                </button>

                {/* Comment button */}
                <button
                  style={styles.actionBtn}
                  onClick={() => {
                    const el = document.getElementById(`comments-${item.id}`)
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                >
                  <MessageCircle size={14} />
                  {item.comments?.length || 0} comments
                </button>

                {/* Report button */}
                <button
                  style={styles.actionBtn}
                  onClick={() => navigate(`/content/${item.id}`)}
                >
                  <Eye size={14} />
                  View details
                </button>

                <button
                  style={{ ...styles.actionBtn, ...styles.flagBtn }}
                  onClick={() => navigate(`/report/${item.id}`)}
                >
                  <Flag size={14} />
                  Report bias
                </button>

              </div>

              {/* Comments Section */}
              <div id={`comments-${item.id}`} style={styles.commentSection}>

                <div style={styles.commentList}>
                  {item.comments?.length === 0 && (
                    <p style={styles.noComments}>No comments yet. Be the first!</p>
                  )}
                  {item.comments?.map(c => (
                    <div key={c.id} style={styles.commentItem}>
                      <div style={styles.commentAvatar}>
                        {c.username?.[0]?.toUpperCase()}
                      </div>
                      <div style={styles.commentBody}>
                        <span style={styles.commentAuthor}>{c.username}</span>
                        {editingComment === c.id ? (
                          <input
                            style={styles.editCommentInput}
                            value={editCommentText}
                            onChange={e => setEditCommentText(e.target.value)}
                          />
                        ) : (
                          <span style={styles.commentText}>{c.text}</span>
                        )}
                        <span style={styles.commentDate}>
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                        {user?.id === c.user_id && (
                          <span style={styles.commentActions}>
                            {editingComment === c.id ? (
                              <>
                                <button style={styles.commentIconBtn} onClick={() => handleUpdateComment(item.id, c.id)} title="Save comment">
                                  <Check size={12} />
                                </button>
                                <button style={styles.commentIconBtn} onClick={cancelEditComment} title="Cancel edit">
                                  <X size={12} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button style={styles.commentIconBtn} onClick={() => startEditComment(c)} title="Edit comment">
                                  <Edit3 size={12} />
                                </button>
                                <button style={styles.commentIconBtnDanger} onClick={() => handleDeleteComment(item.id, c.id)} title="Delete comment">
                                  <Trash2 size={12} />
                                </button>
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <form
                  style={styles.commentForm}
                  onSubmit={e => handleAddComment(e, item.id)}
                >
                  <input
                    style={styles.commentInput}
                    placeholder="Add a comment..."
                    value={commentInputs[item.id] || ''}
                    onChange={e =>
                      setCommentInputs(prev => ({ ...prev, [item.id]: e.target.value }))
                    }
                  />
                  <button type="submit" style={styles.commentSendBtn}>Post</button>
                </form>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', padding: '2rem', color: '#fff' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.2rem' },
  subtitle: { color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' },
  refreshBtn: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'rgba(96,165,250,0.15)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(96,165,250,0.4)', color: '#bfdbfe', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' },
  loading: { marginTop: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.6)' },
  empty: { marginTop: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' },
  primaryBtn: { padding: '0.75rem 1.5rem', background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', borderWidth: '0', borderStyle: 'solid', borderColor: 'transparent', color: '#fff', borderRadius: '10px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600' },
  filters: { maxWidth: '820px', margin: '0 auto 1.5rem auto', display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', background: 'rgba(255,255,255,0.04)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1rem' },
  searchWrap: { display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'rgba(0,0,0,0.2)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.75rem 0.9rem' },
  searchInput: { flex: 1, background: 'transparent', borderWidth: 0, color: '#fff', outline: 'none', fontSize: '0.9rem', minWidth: 0 },
  filterGroup: { display: 'grid', gridTemplateColumns: 'auto repeat(3, minmax(0, 1fr))', alignItems: 'center', gap: '0.6rem' },
  select: { width: '100%', minWidth: 0, padding: '0.65rem 0.75rem', background: 'rgba(0,0,0,0.2)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff', outline: 'none', fontSize: '0.85rem' },
  feed: { display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '820px', margin: '0 auto' },

  // Card
  card: { background: 'rgba(255,255,255,0.04)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  cardHeaderLeft: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  userAvatar: { width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem', color: '#fff', flexShrink: 0 },
  cardUsername: { color: '#fff', fontWeight: '600', fontSize: '0.9rem', margin: 0 },
  cardDate: { color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', margin: 0 },
  badge: { padding: '0.25rem 0.8rem', borderRadius: '999px', fontSize: '0.75rem', background: 'rgba(167,139,250,0.18)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(167,139,250,0.4)', color: '#e9d5ff', textTransform: 'uppercase', letterSpacing: '0.08em' },
  image: { width: '100%', borderRadius: '12px', marginBottom: '1rem', borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.08)' },
  textContent: { background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '1rem', fontSize: '0.95rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.85)', marginBottom: '1rem' },
  fileContent: { display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '1rem', color: 'rgba(255,255,255,0.85)', marginBottom: '1rem', textDecoration: 'none', borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  infoRow: { display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1rem' },
  infoItem: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', margin: 0 },
  infoLabel: { fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.3)', marginRight: '0.35rem' },

  // Actions
  actionsRow: { display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' },
  actionBtn: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem', background: 'rgba(255,255,255,0.04)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '999px', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', cursor: 'pointer' },
  likedBtn: { background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.35)', color: '#f87171' },
  flagBtn: { background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)', color: '#fecaca', marginLeft: 'auto' },

  // Comments
  commentSection: { borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: '1rem' },
  commentList: { display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '0.75rem' },
  commentItem: { display: 'flex', gap: '0.6rem', alignItems: 'flex-start' },
  commentAvatar: { width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', color: '#fff', flexShrink: 0 },
  commentBody: { display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'baseline' },
  commentAuthor: { fontWeight: '600', color: '#e5e7eb', fontSize: '0.82rem' },
  commentText: { color: 'rgba(209,213,219,0.9)', fontSize: '0.85rem' },
  commentDate: { color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem' },
  commentActions: { display: 'inline-flex', gap: '0.25rem', alignItems: 'center' },
  commentIconBtn: { width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(96,165,250,0.12)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(96,165,250,0.25)', color: '#93c5fd', borderRadius: '6px', cursor: 'pointer' },
  commentIconBtnDanger: { width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.1)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(239,68,68,0.22)', color: '#f87171', borderRadius: '6px', cursor: 'pointer' },
  editCommentInput: { minWidth: '180px', flex: 1, padding: '0.35rem 0.55rem', borderRadius: '8px', borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.25)', color: '#fff', outline: 'none', fontSize: '0.85rem' },
  noComments: { fontSize: '0.82rem', color: 'rgba(148,163,184,0.7)', margin: 0 },
  commentForm: { display: 'flex', gap: '0.5rem' },
  commentInput: { flex: 1, padding: '0.5rem 0.9rem', borderRadius: '999px', borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '0.85rem', outline: 'none' },
  commentSendBtn: { padding: '0.45rem 1rem', borderRadius: '999px', borderWidth: '0', borderStyle: 'solid', borderColor: 'transparent', background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', color: '#fff', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' }
}

export default Feed
