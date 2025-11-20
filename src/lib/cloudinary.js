// src/lib/cloudinary.js
export async function uploadToCloudinary(file) {
  // THAY 2 CHỮ NÀY BẰNG CỦA BẠN
  const CLOUD_NAME = 'dbmtfhjhw'          // ← thay bằng cloud name của bạn
  const UPLOAD_PRESET = 'facebook_clone'  // ← tạo 1 unsigned preset trên Cloudinary

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      {
        method: 'POST',
        body: formData
      }
    )

    const data = await res.json()

    if (!res.ok) {
      console.error('Upload Cloudinary lỗi:', data)
      return null
    }

    return {
      url: data.secure_url,
      publicId: data.public_id,
      type: data.resource_type === 'video' ? 'video' : 'image'
    }
  } catch (err) {
    console.error('Lỗi upload:', err)
    return null
  }
}