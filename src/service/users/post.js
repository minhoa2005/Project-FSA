// src/service/posts.js
'use server'


import { connectDB } from '@/config/db'
import { revalidatePath } from 'next/cache'
const pool = await connectDB();


// LẤY TẤT CẢ BÀI VIẾT (Blogs)
export async function getAllBlogs() {
  try {
    
    const result = await pool.request().query(`
      SELECT 
        b.id,
        b.text AS content,
        b.image,
        b.video,
        b.createdAt,
        a.username,
        up.fullName,
        up.imgUrl AS avatar
      FROM Blogs b
      INNER JOIN Account a ON b.creatorId = a.id
      LEFT JOIN UserProfile up ON a.id = up.accountId
      ORDER BY b.createdAt DESC
    `)

    const posts = result.recordset.map(row => {
      const media = []

      if (row.image) {
        row.image.split(',').forEach(url => {
          if (url.trim()) media.push({ type: 'image', url: url.trim() })
        })
      }
      if (row.video) {
        row.video.split(',').forEach(url => {
          if (url.trim()) media.push({ type: 'video', url: url.trim() })
        })
      }

      return {
        id: row.id,
        content: row.content,
        createdAt: row.createdAt,
        author: {
          name: row.fullName || row.username || 'Người dùng',
          image: row.avatar || '/avatar.png'
        },
        media
      }
    })

    return posts
  } catch (error) {
    console.error('Lỗi lấy bài viết:', error)
    return []
  }
}

// TẠO BÀI VIẾT MỚI
export async function createBlog(formData) {
  const content = formData.get('content')?.toString().trim()
  const files = formData.getAll('media') // FileList

  if (!content && files.length === 0) {
    return { success: false, message: 'Nội dung hoặc ảnh/video không được để trống' }
  }

  try {
    // Xử lý file → base64 (test nhanh) hoặc upload Cloudinary thật sau
    const mediaUrls = await Promise.all(
      files.map(async (file) => {
        if (file.size === 0) return null
        const buffer = Buffer.from(await file.arrayBuffer())
        const base64 = `data:${file.type};base64,${buffer.toString('base64')}`
        return base64
      })
    )

    const validUrls = mediaUrls.filter(Boolean)
    const images = validUrls.filter(url => url.includes('image/')).join(',') || null
    const videos = validUrls.filter(url => url.includes('video/')).join(',') || null

    
    await pool.request()
      .input('text', content || null)
      .input('image', images)
      .input('video', videos)
      .input('creatorId', 1) // TODO: thay bằng session.user.id
      .query(`
        INSERT INTO Blogs (text, image, video, creatorId)
        VALUES (@text, @image, @video, @creatorId)
      `)

    revalidatePath('/(private)/(user)')
    return { success: true }
  } catch (error) {
    console.error('Lỗi tạo bài viết:', error)
    return { success: false, message: 'Đăng bài thất bại!' }
  }
}