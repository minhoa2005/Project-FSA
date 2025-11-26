"use server";

import { getCookie } from "@/config/cookie";
import { connectDB, sql } from "@/config/db";
import { verifyToken } from "@/config/jwt";
import { verifyUser } from "./personalInfo";

const pool = await connectDB();

// ==========================
//        TYPES
// ==========================
export type FollowUser = {
  id: number;
  username: string;
  email: string;
  imgUrl: string | null;
};

export type Message = {
  id: number;
  senderId: number;
  receiverId: number;
  roomId: string;
  text: string;
  type: "text" | "image" | "file";
  createdAt: string;
};

export type MessageListResult = {
  roomId: string;
  messages: Message[];
};

// ==========================
//   GET FOLLOWING USERS
// ==========================
export async function getFollowingUsers(
  offset: number,
  limit: number
): Promise<FollowUser[]> {
  if (!(await verifyUser())) {
    throw new Error("Unauthorized");
  }

  const token = await getCookie();
  const decoded = verifyToken(token);
  const userId: number = Number(decoded.id);
  
  const result = await pool
    .request()
    .input("userId", sql.Int, userId)
    .input("offset", sql.Int, offset)
    .input("limit", sql.Int, limit)
    .query(`
      SELECT a.id, a.username, a.email, u.imgUrl
      FROM Follow f
      JOIN Account a ON f.followingId = a.id
      JOIN UserProfile u ON u.accountId = a.id
      WHERE f.followerId = @userId
      ORDER BY a.id
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `);

  return result.recordset as FollowUser[];
}

// ==========================
//       INSERT MESSAGE
// ==========================
export async function insertMessage(
  receiverId: number,
  text: string,
  type: string
): Promise<Message | { success: false }> {
  try {
    const token = await getCookie();
    const decoded = verifyToken(token);
    const senderId: number = Number(decoded.id);

    const id1 = Math.min(senderId, receiverId);
    const id2 = Math.max(senderId, receiverId);
    const roomId = `${id1}_${id2}`;

    const msgType = type?.trim() !== "" ? type : "text";

    const result = await pool
      .request()
      .input("senderId", sql.Int, senderId)
      .input("receiverId", sql.Int, receiverId)
      .input("roomId", sql.VarChar, roomId)
      .input("text", sql.NVarChar, text)
      .input("type", sql.VarChar, msgType)
      .query(`
        INSERT INTO Messages (senderId, receiverId, roomId, text, type, createdAt)
        OUTPUT INSERTED.id, INSERTED.createdAt
        VALUES (@senderId, @receiverId, @roomId, @text, @type, GETDATE());
      `);

    return {
      id: result.recordset[0].id,
      senderId,
      receiverId,
      roomId,
      text,
      type: msgType as "text" | "image" | "file",
      createdAt: result.recordset[0].createdAt,
    };
  } catch (err) {
    console.error("INSERT MESSAGE ERROR:", err);
    return { success: false };
  }
}

// ==========================
//   GET MESSAGES IN ROOM
// ==========================
export async function getMessagesByFollowing(
  receiverId: number
): Promise<MessageListResult> {
  try {
    const token = await getCookie();
    const decoded = verifyToken(token);
    const senderId: number = Number(decoded.id);

    const id1 = Math.min(senderId, receiverId);
    const id2 = Math.max(senderId, receiverId);
    const roomId = `${id1}_${id2}`;

    const result = await pool
      .request()
      .input("roomId", sql.VarChar, roomId)
      .query(`
        SELECT 
          id,
          senderId,
          receiverId,
          roomId,
          text,
          type,
          createdAt
        FROM Messages
        WHERE roomId = @roomId
        ORDER BY createdAt ASC
      `);

    return {
      roomId,
      messages: result.recordset as Message[],
    };
  } catch (err) {
    console.error("GET MESSAGES ERROR:", err);
    return {
      roomId: "",
      messages: [],
    };
  }
}
