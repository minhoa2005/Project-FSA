import { sql, connectDB } from '@/config/db';

// Thêm cột isRead nếu chưa có (migration)
export const ensureIsReadColumn = async () => {
  try {
    const pool = await connectDB();
    await pool.request().query(`
      IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'Messages' AND COLUMN_NAME = 'isRead'
      )
      BEGIN
        ALTER TABLE Messages ADD isRead BIT DEFAULT 0;
      END
    `);
    console.log('✅ isRead column ensured');
  } catch (error) {
    console.error('Error ensuring isRead column:', error);
  }
};

// Lấy số tin nhắn chưa đọc
export const getUnreadCount = async (userId: number) => {
  try {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input('receiverId', sql.Int, userId)
      .query(`
        SELECT COUNT(*) as count FROM Messages 
        WHERE receiverId = @receiverId AND isRead = 0
      `);
    return result.recordset[0]?.count || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

// Lấy số tin nhắn chưa đọc theo room
export const getUnreadCountByRoom = async (userId: number, roomId: string) => {
  try {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input('receiverId', sql.Int, userId)
      .input('roomId', sql.VarChar(50), roomId)
      .query(`
        SELECT COUNT(*) as count FROM Messages 
        WHERE receiverId = @receiverId AND roomId = @roomId AND isRead = 0
      `);
    return result.recordset[0]?.count || 0;
  } catch (error) {
    console.error('Error getting unread count by room:', error);
    return 0;
  }
};

// Mark tin nhắn đã đọc
export const markAsRead = async (userId: number, roomId: string) => {
  try {
    const pool = await connectDB();
    await pool
      .request()
      .input('receiverId', sql.Int, userId)
      .input('roomId', sql.VarChar(50), roomId)
      .query(`
        UPDATE Messages 
        SET isRead = 1 
        WHERE receiverId = @receiverId AND roomId = @roomId AND isRead = 0
      `);
    return { success: true };
  } catch (error) {
    console.error('Error marking as read:', error);
    throw error;
  }
};

// Lấy danh sách conversations với số tin nhắn chưa đọc
export const getConversationsWithUnread = async (userId: number) => {
  try {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT DISTINCT
          CASE 
            WHEN senderId = @userId THEN receiverId 
            ELSE senderId 
          END as otherId,
          (SELECT TOP 1 roomId FROM Messages 
           WHERE (senderId = @userId OR receiverId = @userId) 
           AND (senderId = CASE WHEN senderId = @userId THEN receiverId ELSE senderId END 
                OR receiverId = CASE WHEN senderId = @userId THEN receiverId ELSE senderId END)
           ORDER BY createdAt DESC) as roomId,
          COUNT(CASE WHEN receiverId = @userId AND isRead = 0 THEN 1 END) as unreadCount,
          MAX(createdAt) as lastMessageTime,
          (SELECT TOP 1 text FROM Messages 
           WHERE (senderId = @userId OR receiverId = @userId)
           AND (senderId = CASE WHEN senderId = @userId THEN receiverId ELSE senderId END 
                OR receiverId = CASE WHEN senderId = @userId THEN receiverId ELSE senderId END)
           ORDER BY createdAt DESC) as lastMessage
        FROM Messages
        WHERE senderId = @userId OR receiverId = @userId
        GROUP BY CASE WHEN senderId = @userId THEN receiverId ELSE senderId END
        ORDER BY lastMessageTime DESC
      `);
    return result.recordset;
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
};
