import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Check, Edit3, FileText, Flag, Heart, MessageCircle, Send, Sparkles, Trash2, User, X } from 'lucide-react'
import API from '../services/api'
import { getUploadUrl } from '../services/uploads'
import { useAuth } from '../context/AuthContext'

function ContentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [content, setContent] = useState(null)
  const [comments, setComments] = useState([])
  const [likes, setLikes] = useState({ count: 0, userLiked: false })
  const [commentText, setCommentText] = useState('')
  const [editingComment, setEditingComment] = useState(null)
  const [editCommentText, setEditCommentText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true)
      setError('')
      try {
        const [contentRes, commentsRes] = await Promise.all([
          API.get(`/content/${id}`),
          API.get(`/comments/${id}`)
        ])
        setContent(contentRes.data)
        setComments(commentsRes.data)

        try {
          const likesRes = await API.get(`/likes/${id}`)
          setLikes(likesRes.data)
        } catch {
          setLikes({ count: 0, userLiked: false })
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load this content.')
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [id])

  const handleLike = async () => {
    try {
      await API.post('/likes', { content_id: id })
      setLikes(prev => ({
        count: prev.userLiked ? prev.count - 1 : prev.count + 1,
        userLiked: !prev.userLiked
      }))
    } catch {
      navigate('/login')
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    const text = commentText.trim()
    if (!text) return

    try {
      await API.post('/comments', { content_id: id, text })
      const commentsRes = await API.get(`/comments/${id}`)
      setComments(commentsRes.data)
      setCommentText('')
    } catch {
      navigate('/login')
    }
  }

  const refreshComments = async () => {
    const commentsRes = await API.get(`/comments/${id}`)
    setComments(commentsRes.data)
  }

  const startEditComment = (comment) => {
    setEditingComment(comment.id)
    setEditCommentText(comment.text)
  }

  const cancelEditComment = () => {
    setEditingComment(null)
    setEditCommentText('')
  }

  const handleUpdateComment = async (commentId) => {
    const text = editCommentText.trim()
    if (!text) return

    try {
      await API.put(`/comments/${commentId}`, { text })
      await refreshComments()
      cancelEditComment()
    } catch {
      navigate('/login')
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await API.delete(`/comments/${commentId}`)
      await refreshComments()
    } catch {
      navigate('/login')
    }
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.centerText}>Loading content...</div>
      </div>
    )
  }

  if (error || !content) {
    return (
      <div style={styles.page}>
        <div style={styles.empty}>
          <p>{error || 'Content not found.'}</p>
          <button style={styles.primaryBtn} onClick={() => navigate('/feed')}>Back to Feed</button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => navigate('/feed')}>
        <ArrowLeft size={16} /> Back to Feed
      </button>

      <div style={styles.layout}>
        <main style={styles.mainPanel}>
          <div style={styles.cardHeader}>
            <div style={styles.author}>
              <div style={styles.avatar}>{content.username?.[0]?.toUpperCase()}</div>
              <div>
                <p style={styles.authorName}>{content.username}</p>
                <p style={styles.date}>
                  <Calendar size={13} /> {new Date(content.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
            <span style={styles.typeBadge}>{content.type}</span>
          </div>

          {content.type === 'image' && content.file_path && (
            <img src={getUploadUrl(content.file_path)} alt="AI generated content" style={styles.image} />
          )}

          {content.type === 'text' && (
            <div style={styles.textContent}>{content.text_content}</div>
          )}

          {content.type === 'file' && content.file_path && (
            <a
              href={getUploadUrl(content.file_path)}
              target="_blank"
              rel="noreferrer"
              style={styles.fileContent}
            >
              <FileText size={28} color="#a78bfa" />
              <div>
                <p style={styles.fileTitle}>Open uploaded file</p>
                <p style={styles.fileName}>{content.file_path}</p>
              </div>
            </a>
          )}

          <div style={styles.actions}>
            <button style={{ ...styles.actionBtn, ...(likes.userLiked ? styles.likedBtn : {}) }} onClick={handleLike}>
              <Heart size={15} fill={likes.userLiked ? '#f87171' : 'none'} />
              {likes.count} likes
            </button>
            <button style={styles.actionBtn} onClick={() => navigate(`/report/${content.id}`)}>
              <Flag size={15} /> Report bias
            </button>
          </div>
        </main>

        <aside style={styles.sidePanel}>
          <section style={styles.metaCard}>
            <h3 style={styles.sectionTitle}><Sparkles size={16} /> Generation Details</h3>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Prompt</span>
              <p style={styles.metaValue}>{content.prompt || 'No prompt provided'}</p>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>AI Model</span>
              <p style={styles.metaValue}>{content.ai_model || 'Unknown model'}</p>
            </div>
          </section>

          <section style={styles.metaCard}>
            <h3 style={styles.sectionTitle}><MessageCircle size={16} /> Discussion</h3>
            <div style={styles.commentList}>
              {comments.length === 0 && <p style={styles.noComments}>No comments yet.</p>}
              {comments.map(comment => (
                <div key={comment.id} style={styles.comment}>
                  <div style={styles.commentAvatar}><User size={13} /></div>
                  <div style={styles.commentContent}>
                    <p style={styles.commentAuthor}>{comment.username}</p>
                    {editingComment === comment.id ? (
                      <input
                        style={styles.editCommentInput}
                        value={editCommentText}
                        onChange={e => setEditCommentText(e.target.value)}
                      />
                    ) : (
                      <p style={styles.commentText}>{comment.text}</p>
                    )}
                    {user?.id === comment.user_id && (
                      <div style={styles.commentActions}>
                        {editingComment === comment.id ? (
                          <>
                            <button style={styles.commentIconBtn} onClick={() => handleUpdateComment(comment.id)} title="Save comment">
                              <Check size={12} />
                            </button>
                            <button style={styles.commentIconBtn} onClick={cancelEditComment} title="Cancel edit">
                              <X size={12} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button style={styles.commentIconBtn} onClick={() => startEditComment(comment)} title="Edit comment">
                              <Edit3 size={12} />
                            </button>
                            <button style={styles.commentIconBtnDanger} onClick={() => handleDeleteComment(comment.id)} title="Delete comment">
                              <Trash2 size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form style={styles.commentForm} onSubmit={handleComment}>
              <input
                style={styles.commentInput}
                placeholder="Add a comment..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
              />
              <button style={styles.sendBtn} type="submit" title="Post comment">
                <Send size={15} />
              </button>
            </form>
          </section>
        </aside>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', color: '#fff', padding: '2.5rem' },
  backBtn: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem' },
  layout: { display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 0.8fr)', gap: '1.5rem', alignItems: 'start' },
  mainPanel: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem' },
  sidePanel: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' },
  author: { display: 'flex', alignItems: 'center', gap: '0.8rem' },
  avatar: { width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 },
  authorName: { margin: 0, color: '#fff', fontWeight: 700 },
  date: { margin: '0.2rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' },
  typeBadge: { padding: '0.25rem 0.8rem', borderRadius: '999px', fontSize: '0.75rem', background: 'rgba(167,139,250,0.18)', border: '1px solid rgba(167,139,250,0.35)', color: '#e9d5ff', textTransform: 'uppercase', letterSpacing: '0.08em' },
  image: { width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '14px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)' },
  textContent: { background: 'rgba(0,0,0,0.22)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.3rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.86)', whiteSpace: 'pre-wrap' },
  fileContent: { display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.22)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.3rem', color: '#fff', textDecoration: 'none' },
  fileTitle: { color: '#fff', margin: 0, fontWeight: 800 },
  fileName: { color: 'rgba(255,255,255,0.45)', margin: '0.25rem 0 0 0', fontSize: '0.86rem' },
  actions: { display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1.25rem' },
  actionBtn: { display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '999px', color: 'rgba(255,255,255,0.68)', cursor: 'pointer', fontSize: '0.86rem' },
  likedBtn: { background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.35)', color: '#f87171' },
  metaCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.25rem' },
  sectionTitle: { margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontSize: '1rem' },
  metaItem: { borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.85rem', marginTop: '0.85rem' },
  metaLabel: { color: 'rgba(255,255,255,0.32)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' },
  metaValue: { color: 'rgba(255,255,255,0.78)', fontSize: '0.92rem', lineHeight: 1.55, margin: '0.35rem 0 0 0' },
  commentList: { display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1rem', maxHeight: '340px', overflowY: 'auto' },
  comment: { display: 'flex', gap: '0.7rem', alignItems: 'flex-start' },
  commentAvatar: { width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(167,139,250,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c4b5fd', flexShrink: 0 },
  commentContent: { flex: 1, minWidth: 0 },
  commentAuthor: { color: '#fff', fontWeight: 700, fontSize: '0.82rem', margin: 0 },
  commentText: { color: 'rgba(255,255,255,0.62)', fontSize: '0.85rem', lineHeight: 1.5, margin: '0.15rem 0 0 0' },
  commentActions: { display: 'flex', gap: '0.3rem', marginTop: '0.45rem' },
  commentIconBtn: { width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)', color: '#93c5fd', borderRadius: '6px', cursor: 'pointer' },
  commentIconBtnDanger: { width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.22)', color: '#f87171', borderRadius: '6px', cursor: 'pointer' },
  editCommentInput: { width: '100%', marginTop: '0.25rem', padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.25)', color: '#fff', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' },
  noComments: { color: 'rgba(255,255,255,0.35)', fontSize: '0.86rem', margin: 0 },
  commentForm: { display: 'flex', gap: '0.5rem' },
  commentInput: { flex: 1, minWidth: 0, padding: '0.65rem 0.9rem', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', outline: 'none' },
  sendBtn: { width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 },
  centerText: { minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.55)' },
  empty: { minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'rgba(255,255,255,0.7)' },
  primaryBtn: { padding: '0.75rem 1.5rem', background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', border: 'none', color: '#fff', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }
}

export default ContentDetail
