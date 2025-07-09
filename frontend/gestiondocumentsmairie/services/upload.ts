import axios from 'axios'

export const uploadLogo = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)

  const res = await axios.post<{ url: string }>('/api/upload-logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

  return res.data.url
}
