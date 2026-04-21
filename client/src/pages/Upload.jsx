import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, X, FileText, Image, Type, CheckCircle, XCircle } from 'lucide-react'
import API from '../services/api'

function Upload() {
  const [form, setForm] = useState({ type: 'text', prompt: '', ai_model: '', text_content: '' })
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [modal, setModal] = useState(null)
  const [modelOpen, setModelOpen] = useState(false)
  const fileInputRef = useRef()
  const navigate = useNavigate()

  useEffect(() => {
    const handler = () => setModelOpen(false)
    if (modelOpen) document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [modelOpen])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleFile = (f) => {
    if (!f) return
    setFile(f)
    setProgress(0)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const removeFile = () => {
    setFile(null)
    setProgress(0)
    fileInputRef.current.value = ''
  }

  const getFileIcon = () => {
    if (!file) return null
    if (file.type.startsWith('image/')) return <Image size={20} color="#a78bfa" />
    return <FileText size={20} color="#60a5fa" />
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    setProgress(10)

    try {
      const formData = new FormData()
      formData.append('type', form.type)
      formData.append('prompt', form.prompt)
      formData.append('ai_model', form.ai_model)
      if (form.type === 'text') {
        formData.append('text_content', form.text_content)
      } else {
        formData.append('file', file)
      }

      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 85) { clearInterval(interval); return p }
          return p + 15
        })
      }, 200)

      await API.post('/content', formData)
      clearInterval(interval)
      setProgress(100)
      setUploading(false)
      setModal({ type: 'success', title: 'Upload Successful!', message: 'Your content has been uploaded successfully. Redirecting to feed...' })
      setTimeout(() => navigate('/feed'), 2000)
    } catch (err) {
      setUploading(false)
      setProgress(0)
      setModal({ type: 'error', title: 'Upload Failed!', message: err.response?.data?.message || 'Something went wrong. Please try again.' })
    }
  }

  const contentTypes = [
    { value: 'text', label: 'Text', icon: Type },
    { value: 'image', label: 'Image', icon: Image },
    { value: 'file', label: 'File', icon: FileText },
  ]

  const aiModels = ['ChatGPT-4', 'ChatGPT-3.5', 'Gemini', 'Claude', 'Midjourney', 'DALL-E', 'Stable Diffusion', 'Other']

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Upload Content</h2>
            <p style={styles.subtitle}>Share AI-generated content for bias analysis</p>
          </div>
          <button style={styles.closeBtn} onClick={() => navigate('/feed')}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Content Type */}
          <div style={styles.section}>
            <label style={styles.label}>Content Type</label>
            <div style={styles.typeRow}>
              {contentTypes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  style={form.type === value ? styles.typeActiveBtn : styles.typeBtn}
                  onClick={() => { setForm({ ...form, type: value }); setFile(null) }}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Drag & Drop Zone */}
          {form.type !== 'text' && (
            <div style={styles.section}>
              <label style={styles.label}>Upload File</label>

              {!file ? (
                <div
                  style={dragOver ? { ...styles.dropZone, ...styles.dropZoneActive } : styles.dropZone}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                >
                  <div style={styles.dropIcon}>
                    <UploadCloud size={32} color={dragOver ? '#a78bfa' : 'rgba(255,255,255,0.3)'} />
                  </div>
                  <p style={styles.dropText}>
                    Drag and Drop file here or{' '}
                    <span style={styles.chooseLink}>Choose file</span>
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={form.type === 'image' ? 'image/*' : '*'}
                    style={{ display: 'none' }}
                    onChange={e => handleFile(e.target.files[0])}
                  />
                </div>
              ) : (
                <div style={styles.filePreview}>
                  <div style={styles.fileIcon}>{getFileIcon()}</div>
                  <div style={styles.fileInfo}>
                    <p style={styles.fileName}>{file.name}</p>
                    <p style={styles.fileSize}>{formatSize(file.size)}</p>
                    {uploading && (
                      <>
                        <div style={styles.progressWrap}>
                          <div style={{ ...styles.progressBar, width: `${progress}%` }} />
                        </div>
                        <p style={styles.progressText}>{progress}%</p>
                      </>
                    )}
                  </div>
                  {!uploading && (
                    <button type="button" style={styles.removeBtn} onClick={removeFile}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              )}

              <div style={styles.dropMeta}>
                <span>Supported: JPG, PNG, PDF, MP4</span>
                <span>Maximum size: 25MB</span>
              </div>
            </div>
          )}

          {/* Text Content */}
          {form.type === 'text' && (
            <div style={styles.section}>
              <label style={styles.label}>Text Content</label>
              <textarea
                name="text_content"
                value={form.text_content}
                onChange={handleChange}
                placeholder="Paste your AI-generated text here..."
                style={styles.textarea}
                rows={5}
                required
              />
            </div>
          )}

          {/* Prompt */}
          <div style={styles.section}>
            <label style={styles.label}>Prompt Used</label>
            <input
              name="prompt"
              value={form.prompt}
              onChange={handleChange}
              placeholder="What prompt did you use to generate this content?"
              style={styles.input}
              required
            />
          </div>

          {/* AI Model - Custom Dropdown */}
          <div style={styles.section}>
            <label style={styles.label}>AI Model</label>
            <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
              <button
                type="button"
                style={styles.selectBtn}
                onClick={() => setModelOpen(!modelOpen)}
              >
                <span style={{ color: form.ai_model ? '#fff' : 'rgba(255,255,255,0.3)' }}>
                  {form.ai_model || 'Select AI model...'}
                </span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                  style={{ transform: modelOpen ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s', flexShrink: 0 }}>
                  <path d="M2 4l4 4 4-4" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {modelOpen && (
                <div style={styles.dropdown}>
                  {aiModels.map(model => (
                    <div
                      key={model}
                      style={form.ai_model === model ? styles.dropdownItemActive : styles.dropdownItem}
                      onMouseEnter={e => { if (form.ai_model !== model) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                      onMouseLeave={e => { if (form.ai_model !== model) e.currentTarget.style.background = 'transparent' }}
                      onClick={() => { setForm({ ...form, ai_model: model }); setModelOpen(false) }}
                    >
                      {model}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <button type="button" style={styles.cancelBtn} onClick={() => navigate('/feed')}>
              Cancel
            </button>
            <button type="submit" style={styles.submitBtn} disabled={uploading}>
              {uploading ? `Uploading... ${progress}%` : 'Upload Content'}
            </button>
          </div>

        </form>
      </div>

      {/* Modal */}
      {modal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <button style={modalStyles.closeBtn} onClick={() => setModal(null)}><X size={16} /></button>
            <div style={modal.type === 'success' ? modalStyles.iconWrapGreen : modalStyles.iconWrapRed}>
              {modal.type === 'success'
                ? <CheckCircle size={32} color="#22c55e" />
                : <XCircle size={32} color="#ef4444" />}
            </div>
            <h3 style={modalStyles.title}>{modal.title}</h3>
            <p style={modalStyles.message}>{modal.message}</p>
            <button
              style={modal.type === 'success' ? modalStyles.successBtn : modalStyles.errorBtn}
              onClick={() => setModal(null)}
            >
              {modal.type === 'success' ? 'Close' : 'Try Again'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '560px', backdropFilter: 'blur(10px)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' },
  title: { color: '#fff', fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.3rem' },
  subtitle: { color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' },
  closeBtn: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', display: 'flex' },
  section: { marginBottom: '1.5rem' },
  label: { display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' },
  typeRow: { display: 'flex', gap: '0.75rem' },
  typeBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.65rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' },
  typeActiveBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.65rem', background: 'linear-gradient(90deg, rgba(167,139,250,0.2), rgba(96,165,250,0.2))', border: '1px solid rgba(167,139,250,0.5)', color: '#a78bfa', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' },
  dropZone: { border: '2px dashed rgba(255,255,255,0.12)', borderRadius: '14px', padding: '2.5rem 1rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' },
  dropZoneActive: { border: '2px dashed #a78bfa', background: 'rgba(167,139,250,0.06)' },
  dropIcon: { width: '64px', height: '64px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' },
  dropText: { color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' },
  chooseLink: { color: '#a78bfa', textDecoration: 'underline', cursor: 'pointer' },
  dropMeta: { display: 'flex', justifyContent: 'space-between', marginTop: '0.6rem', color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem' },
  filePreview: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' },
  fileIcon: { width: '40px', height: '40px', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  fileInfo: { flex: 1, minWidth: 0 },
  fileName: { color: '#fff', fontSize: '0.9rem', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  fileSize: { color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem', marginTop: '0.2rem' },
  progressWrap: { height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', marginTop: '0.6rem', overflow: 'hidden' },
  progressBar: { height: '100%', background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', borderRadius: '4px', transition: 'width 0.3s ease' },
  progressText: { color: '#a78bfa', fontSize: '0.75rem', marginTop: '0.3rem' },
  removeBtn: { padding: '0.3rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '6px', cursor: 'pointer', display: 'flex', flexShrink: 0 },
  textarea: { width: '100%', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.6 },
  input: { width: '100%', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' },
  selectBtn: { width: '100%', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' },
  dropdown: { position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', zIndex: 100, overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.5)' },
  dropdownItem: { padding: '0.75rem 1rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', cursor: 'pointer', background: 'transparent', transition: 'background 0.15s' },
  dropdownItemActive: { padding: '0.75rem 1rem', background: 'linear-gradient(90deg, rgba(167,139,250,0.2), rgba(96,165,250,0.2))', color: '#a78bfa', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '600' },
  footer: { display: 'flex', gap: '0.75rem', marginTop: '0.5rem' },
  cancelBtn: { flex: 1, padding: '0.85rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', borderRadius: '10px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600' },
  submitBtn: { flex: 2, padding: '0.85rem', background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', border: 'none', color: '#fff', borderRadius: '10px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '700' }
}

const modalStyles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  modal: { background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2.5rem 2rem', width: '100%', maxWidth: '360px', textAlign: 'center', position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' },
  closeBtn: { position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.5)', borderRadius: '6px', padding: '0.3rem', cursor: 'pointer', display: 'flex' },
  iconWrapGreen: { width: '64px', height: '64px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' },
  iconWrapRed: { width: '64px', height: '64px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' },
  title: { color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.75rem' },
  message: { color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' },
  successBtn: { width: '100%', padding: '0.75rem', background: 'linear-gradient(90deg, #22c55e, #16a34a)', border: 'none', color: '#fff', borderRadius: '10px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600' },
  errorBtn: { width: '100%', padding: '0.75rem', background: 'linear-gradient(90deg, #ef4444, #dc2626)', border: 'none', color: '#fff', borderRadius: '10px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600' }
}

export default Upload
