"use server";

import { getCookie } from "@/config/cookie";
import { connectDB, sql } from "@/config/db";
import { verifyToken } from "@/config/jwt";
import { verifyUser } from "./personalInfo";
const pool = await connectDB();
export async function createGroup(
  name: string,
  memberIds: number[]
) {
  try {
    // Lấy owner từ token
    const token = await getCookie();
    const decoded = verifyToken(token);
    const ownerId = Number(decoded.id);

    if (!name || name.trim() === "") {
      return { success: false, message: "Group name required" };
    }

    // 1) Insert GROUP
    const result = await pool
      .request()
      .input("name", sql.NVarChar, name)
      .input("ownerId", sql.Int, ownerId)
      .query(`
        INSERT INTO Groups (name, ownerId)
        OUTPUT INSERTED.id, INSERTED.name, INSERTED.ownerId, INSERTED.createdAt
        VALUES (@name, @ownerId)
      `);

    const group = result.recordset[0];
    const groupId = group.id;

    // 2) Insert owner vào GroupMembers
    await pool
      .request()
      .input("groupId", sql.Int, groupId)
      .input("userId", sql.Int, ownerId)
      .query(`
        INSERT INTO GroupMembers (groupId, userId)
        VALUES (@groupId, @userId)
      `);

    // 3) Insert các member còn lại
    for (const userId of memberIds) {
      await pool
        .request()
        .input("groupId", sql.Int, groupId)
        .input("userId", sql.Int, userId)
        .query(`
          INSERT INTO GroupMembers (groupId, userId)
          VALUES (@groupId, @userId)
        `);
    }

    return {
      success: true,
      group
    };
  } catch (err) {
    console.error("CREATE GROUP ERROR:", err);
    return { success: false, message: "Server error" };
  }
}


export async function getUserGroups() {
  try {
    const token = await getCookie();
    const decoded = verifyToken(token);
    const userId = Number(decoded.id);

    const result = await pool.request()
      .input("userId", sql.Int, userId)
      .query(`
        SELECT g.id, g.name, g.ownerId, g.createdAt
        FROM Groups g
        JOIN GroupMembers gm ON gm.groupId = g.id
		    JOIN Account a ON a.id = gm.userId
		    JOIN UserProfile u ON u.accountId = a.id
        WHERE gm.userId = @userId
        ORDER BY g.createdAt DESC
      `);

    return result.recordset;
  } catch (err) {
    console.error("GET USER GROUPS ERROR:", err);
    return [];
  }
}

export async function getGroupMessages(groupId: number) {
  try {
    const result = await pool
      .request()
      .input("groupId", sql.Int, groupId)
      .query(`
        SELECT gm.*, a.username AS senderName
        FROM GroupMessages gm
        JOIN Account a ON gm.senderId = a.id
        WHERE gm.groupId = @groupId
        ORDER BY gm.createdAt ASC
      `);

    return result.recordset;
  } catch (err) {
    console.error("GET GROUP MESSAGE ERROR:", err);
    return [];
  }
}

export async function insertGroupMessage(
  groupId: number,
  message: string,
  type: string = "text",
  fileUrl?: string
) {
  try {
    const token = await getCookie();
    const decoded = verifyToken(token);
    const senderId = Number(decoded.id);

    const result = await pool
      .request()
      .input("groupId", sql.Int, groupId)
      .input("senderId", sql.Int, senderId)
      .input("message", sql.NVarChar, message) // ✅ ĐÚNG CỘT TRONG DB
      .input("type", sql.VarChar, type)
      .input("fileUrl", sql.VarChar, fileUrl ?? null)
      .query(`
        INSERT INTO GroupMessages (groupId, senderId, message, type, fileUrl)
        OUTPUT INSERTED.*
        VALUES (@groupId, @senderId, @message, @type, @fileUrl)
      `);

    return result.recordset[0];
  } catch (err) {
    console.error("INSERT GROUP MESSAGE ERROR:", err);
    return { success: false };
  }
}

export async function deleteGroupMessage(messageId: number) {
  try {
    if (!(await verifyUser())) {
      return { success: false };
    }

    const token = await getCookie();
    const decoded = verifyToken(token);
    const userId: number = Number(decoded.id);

    const result = await pool
      .request()
      .input("messageId", sql.Int, messageId)
      .input("userId", sql.Int, userId)
      .query(`
        DELETE FROM GroupMessages
        WHERE id = @messageId AND senderId = @userId
      `);

    return { success: true };
  } catch (err) {
    console.error("DELETE GROUP MESSAGE ERROR:", err);
    return { success: false };
  }
}


export async function getGroupMembers(groupId: number) {
  try {
    if (!(await verifyUser())) {
      throw new Error("Unauthorized");
    }

    const result = await pool
      .request()
      .input("groupId", sql.Int, groupId)
      .query(`
        SELECT 
            a.username,
            u.fullName,
            u.imgUrl 
        FROM GroupMembers gm
        JOIN Groups g ON gm.groupId = g.id
        JOIN Account a ON a.id = gm.userId
        JOIN UserProfile u ON u.accountId = a.id
        WHERE gm.groupId = @groupId
      `);

    return {
      success: true,
      members: result.recordset,
    };
  } catch (err) {
    console.error("GET GROUP MEMBERS ERROR:", err);
    return {
      success: false,
      members: [],
    };
  }
}