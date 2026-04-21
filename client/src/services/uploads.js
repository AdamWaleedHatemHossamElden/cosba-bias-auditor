const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const serverUrl = apiUrl.replace(/\/api\/?$/, '')

export const getUploadUrl = (filePath) => `${serverUrl}/uploads/${filePath}`
