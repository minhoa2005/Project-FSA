// src/services/users/postActions.ts
'use server';

import { revalidatePath } from 'next/cache';
import sql from 'mssql';
import { v2 as cloudinary } from 'cloudinary';

// Config Cloudinary (từ .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Config MSSQL connection pool (local, cho ProjectFSA)
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME,  // ProjectFSA
  options: {
    encrypt: false,  // Local: false
    trustServerCertificate: true,
    port: parseInt(process.env.DB_PORT || '1433'),
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | null = null;

// Local helper: Get DB pool (singleton)
async function getDB(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await sql.connect(dbConfig);
    console.log('Connected to ProjectFSA DB');
  }
  return pool;
}

// Type cho BlogPost (dùng ở PostFeed)
export interface BlogPost {
  id: number;
  text: string;
  image?: string;
  video?: string;
  creatorId: number;
  fullName: string;
  imgUrl?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Local helper: Upload media (Cloudinary)
async function uploadMedia(buffer: Buffer, isVideo: boolean, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const resourceType = isVideo ? 'video' : 'image';
    cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) {
          console.error('Upload error:', error);
          reject(error);
        } else {
          resolve(result?.secure_url || '');
        }
      }
    ).end(buffer);
  });
}

// Action tạo Blog mới (đăng bài)
export async function createBlogAction(formData: FormData): Promise<{ success: boolean; blog?: BlogPost; error?: string }> {
  try {
    const text = (formData.get('text') as string)?.trim();
    if (!text || text.length === 0) {
      return { success: false, error: 'Nội dung không được để trống!' };
    }

    const imageFile = formData.get('image') as File | null;
    const videoFile = formData.get('video') as File | null;
    const creatorId = 1;  // Hardcode tạm, thay bằng session.user.id sau

    let imageUrl = '';
    let videoUrl = '';

    // Upload image nếu có
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      imageUrl = await uploadMedia(buffer, false, 'fb-blogs/images');
    }

    // Upload video nếu có
    if (videoFile && videoFile.size > 0) {
      const buffer = Buffer.from(await videoFile.arrayBuffer());
      videoUrl = await uploadMedia(buffer, true, 'fb-blogs/videos');
    }

    // Inline SQL: INSERT Blog + OUTPUT data + join UserProfile cho fullName/imgUrl
    const db = await getDB();
    const result = await db.request()
      .input('text', sql.Text, text)
      .input('image', sql.VarChar(255), imageUrl || null)
      .input('video', sql.VarChar(255), videoUrl || null)
      .input('creatorId', sql.Int, creatorId)
      .query<BlogPost>(`
        INSERT INTO Blogs (text, image, video, creatorId, createdAt, updatedAt)
        OUTPUT 
          INSERTED.id, INSERTED.text, INSERTED.image, INSERTED.video, INSERTED.creatorId, 
          INSERTED.createdAt, INSERTED.updatedAt,
          (SELECT fullName FROM UserProfile up INNER JOIN Account a ON up.accountId = a.id WHERE a.id = INSERTED.creatorId) AS fullName,
          (SELECT imgUrl FROM UserProfile up INNER JOIN Account a ON up.accountId = a.id WHERE a.id = INSERTED.creatorId) AS imgUrl,
          0 AS likesCount, 0 AS commentsCount
        VALUES (@text, @image, @video, @creatorId, GETDATE(), GETDATE())
      `);

    const blog = result.recordset[0];
    revalidatePath('/');  // Refresh feed (giống FB, bài mới hiện top)

    return { success: true, blog };
  } catch (error) {
    console.error('Lỗi tạo bài viết:', error);
    return { success: false, error: 'Có lỗi xảy ra khi đăng bài. Thử lại nhé!' };
  }
}

// Action cập nhật Blog (sửa bài)
export async function updateBlogAction(blogId: number, formData: FormData): Promise<{ success: boolean; blog?: BlogPost; error?: string }> {
  try {
    const text = (formData.get('text') as string)?.trim();
    if (!text || text.length === 0) {
      return { success: false, error: 'Nội dung không được để trống!' };
    }

    const imageFile = formData.get('image') as File | null;
    const existingImage = formData.get('existingImage') as string || '';
    let imageUrl = existingImage;

    // Upload ảnh mới nếu có
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      imageUrl = await uploadMedia(buffer, false, 'fb-blogs/images');
    }

    // Inline SQL: UPDATE Blog + OUTPUT data + join + count likes/comments
    const db = await getDB();
    const result = await db.request()
      .input('id', sql.Int, blogId)
      .input('text', sql.Text, text)
      .input('image', sql.VarChar(255), imageUrl || null)
      .query<BlogPost>(`
        UPDATE Blogs 
        SET text = @text, image = @image, updatedAt = GETDATE()
        OUTPUT 
          INSERTED.id, INSERTED.text, INSERTED.image, INSERTED.video, INSERTED.creatorId, 
          INSERTED.createdAt, GETDATE() AS updatedAt,
          up.fullName, up.imgUrl,
          ISNULL(likes.count, 0) AS likesCount,
          ISNULL(comments.count, 0) AS commentsCount
        FROM Blogs b
        INNER JOIN Account a ON b.creatorId = a.id
        INNER JOIN UserProfile up ON a.id = up.accountId
        LEFT JOIN (SELECT blogId, COUNT(*) AS count FROM [Like] GROUP BY blogId) likes ON b.id = likes.blogId
        LEFT JOIN (SELECT blogId, COUNT(*) AS count FROM Comments GROUP BY blogId) comments ON b.id = comments.blogId
        WHERE b.id = @id
      `);

    if (result.recordset.length === 0) {
      return { success: false, error: 'Không tìm thấy bài viết để sửa!' };
    }

    const blog = result.recordset[0];
    revalidatePath('/');  // Refresh feed

    return { success: true, blog };
  } catch (error) {
    console.error('Lỗi cập nhật bài viết:', error);
    return { success: false, error: 'Có lỗi xảy ra khi sửa bài. Thử lại nhé!' };
  }
}

// Action xóa Blog (xóa bài)
export async function deleteBlogAction(blogId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDB();

    // Inline SQL: Xóa cascade [Like] và Comments trước
    await db.request().input('id', sql.Int, blogId).query('DELETE FROM [Like] WHERE blogId = @id');
    await db.request().input('id', sql.Int, blogId).query('DELETE FROM Comments WHERE blogId = @id');

    // Inline SQL: DELETE Blog
    const result = await db.request().input('id', sql.Int, blogId).query('DELETE FROM Blogs WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return { success: false, error: 'Không tìm thấy bài viết để xóa!' };
    }

    revalidatePath('/');  // Refresh feed (bài biến mất khỏi UI)

    return { success: true };
  } catch (error) {
    console.error('Lỗi xóa bài viết:', error);
    return { success: false, error: 'Có lỗi xảy ra khi xóa bài. Thử lại nhé!' };
  }
}

// Action fetch Blogs (feed, với join + count)
export async function getBlogsAction(limit: number = 10): Promise<BlogPost[]> {
  try {
    const db = await getDB();
    const result = await db.request()
      .input('limit', sql.Int, limit)
      .query<BlogPost>(`
        SELECT b.id, b.text, b.image, b.video, b.creatorId, b.createdAt, b.updatedAt,
               up.fullName, up.imgUrl,
               ISNULL(likes.count, 0) AS likesCount,
               ISNULL(comments.count, 0) AS commentsCount
        FROM Blogs b
        INNER JOIN Account a ON b.creatorId = a.id
        INNER JOIN UserProfile up ON a.id = up.accountId
        LEFT JOIN (SELECT blogId, COUNT(*) AS count FROM [Like] GROUP BY blogId) likes ON b.id = likes.blogId
        LEFT JOIN (SELECT blogId, COUNT(*) AS count FROM Comments GROUP BY blogId) comments ON b.id = comments.blogId
        ORDER BY b.createdAt DESC
        OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY
      `);
    return result.recordset;
  } catch (error) {
    console.error('Lỗi fetch blogs:', error);
    return [];  // Return empty array nếu lỗi, tránh crash
  }
}