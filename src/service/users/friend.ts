"use server"
import { unauthorized } from "next/navigation"
import { verifyUser } from "./personalInfo"
import { connectDB } from "@/config/db"
import { create } from "domain";
import { createNotification } from "./notificationService";

const pool = await connectDB();
const sendInvite = async (userId: number, senderId: number) => {
    if (!(await verifyUser())) {
        unauthorized();
    }
    console.log("sendInvite userId:", userId, "senderId:", senderId);
    try {
        const existingInvite = await pool.request().input("userId", userId)
            .input("senderId", senderId)
            .query(`
                select * from Follow
                where followerId = @userId and followingId = @senderId
            `);
        if (existingInvite.recordset.length > 0) {
            await pool.request().input("userId", userId)
                .input("senderId", senderId)
                .query(`
                insert into Follow(followerId, followingId)
                values(@senderId, @userId)
            `);
            await pool.request().input("userId", userId)
                .input("senderId", senderId)
                .query(`
                    update Follow
                    set isAccepted = 1
                    where followerId = @userId and followingId = @senderId or followerId = @senderId and followingId = @userId
                `);
            await createNotification(senderId, userId, "acceptFriend");
            await createNotification(userId, senderId, "acceptFriend");
            return;
        }
        await pool.request().input("userId", userId)
            .input("senderId", senderId)
            .query(`
                insert into Follow(followerId, followingId)
                values(@senderId, @userId)
            `);

        createNotification(userId, senderId, "follow");
    }
    catch (error) {
        console.log("sendInvite error", error);
    }
}

const acceptInvite = async (userId: number, senderId: number) => {
    if (!(await verifyUser())) {
        unauthorized();
    }
    try {
        console.log("acceptInvite userId:", userId, "senderId:", senderId);
        await pool.request().input("userId", userId)
            .input("senderId", senderId)
            .query(`
                update Follow
                set isAccepted = 1
                where followerId = @senderId and followingId = @userId
            `);
        await pool.request().input("userId", userId)
            .input("senderId", senderId)
            .query(`
                insert into Follow(followerId, followingId, isAccepted)
                values(@userId, @senderId, 1)
            `);
        createNotification(senderId, userId, "acceptFriend");
    }
    catch (error) {
        console.log("acceptInvite error", error);
    }
}

const cancelInvite = async (userId: number, senderId: number) => {
    if (!(await verifyUser())) {
        unauthorized();
    }
    try {
        await pool.request().input("userId", userId)
            .input("senderId", senderId)
            .query(`
                delete from Follow
                where followerId = @senderId and followingId = @userId
            `);
    }
    catch (error) {
        console.log("cancleInvite error", error);
    }
}

const removeFriend = async (userId: number, friendId: number) => {
    if (!(await verifyUser())) {
        unauthorized();
    }
    try {
        await pool.request().input("userId", userId)
            .input("friendId", friendId)
            .query(`
                delete from Follow
                where (followerId = @userId and followingId = @friendId)
                or (followerId = @friendId and followingId = @userId)
            `);
    }
    catch (error) {
        console.log("removeFriend error", error);
    }
}

const getStatusFriend = async (userId: number, friendId: number) => {
    if (!(await verifyUser())) {
        unauthorized();
    }
    try {
        const result = await pool.request().input("userId", userId)
            .input("friendId", friendId)
            .query(` 
                select isAccepted from Follow
                where followerId = @userId and followingId = @friendId
            `);
        if (result.recordset.length === 0) {
            return {
                success: true,
                data: 0
            }
        }
        if (!result.recordset[0].isAccepted) {
            return {
                success: true,
                data: 1
            }
        }
        return {
            success: true,
            data: 2
        }
    }
    catch (error) {
        console.error('getStatusFriend error:', error);
        return {
            success: false,
            message: "Hệ thống gặp sự cố, vui lòng thử lại sau!"
        }
    }
}

export { sendInvite, acceptInvite, removeFriend, getStatusFriend, cancelInvite };