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
        const check = await pool.request().input("userId", userId)
            .input("friendId", friendId)
            .query(` 
                select isAccepted from Follow
                where followerId = @friendId and followingId = @userId
            `);
        console.log(check)
        if (check.recordset.length !== 0 && !check.recordset[0].isAccepted) {
            return {
                success: true,
                data: 3
            }
        }
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

const getFriendsList = async (userId: number) => {
    if (!(await verifyUser())) {
        unauthorized();
    }
    try {
        const result = await pool.request().input("userId", userId)
            .query(`
                WITH Friends AS (
                    SELECT followingId AS friendId FROM Follow WHERE followerId = @userId AND isAccepted = 1
                    UNION
                    SELECT followerId AS friendId FROM Follow WHERE followingId = @userId AND isAccepted = 1
                )
                SELECT a.id, a.username, up.fullName, up.imgUrl, up.location, up.homeTown
                FROM Friends f
                JOIN Account a ON a.id = f.friendId
                LEFT JOIN UserProfile up ON up.accountId = a.id
                ORDER BY up.fullName;
            `);
        return {
            success: true,
            data: result.recordset
        };
    } catch (error) {
        console.error("getFriendsList error:", error);
        return { success: false, message: "Hệ thống gặp sự cố, vui lòng thử lại sau!" };
    }
};

const getInvitesReceived = async (userId: number) => {
    console.log("getInvitesReceived userId:", userId);
    if (!(await verifyUser())) {
        unauthorized();
    }
    try {
        const result = await pool.request().input("userId", userId)
            .query(`
                SELECT f.followerId AS senderId, a.username, up.fullName, up.imgUrl, f.followAt
                FROM Follow f
                JOIN Account a ON a.id = f.followerId
                LEFT JOIN UserProfile up ON up.accountId = a.id
                WHERE f.followingId = @userId AND f.isAccepted = 0
                ORDER BY f.followAt DESC;
            `);
        console.log("getInvitesReceived result:", result);
        return {
            success: true,
            data: result.recordset
        };
    } catch (error) {
        console.error("getInvitesReceived error:", error);
        return { success: false, message: "Hệ thống gặp sự cố, vui lòng thử lại sau!" };
    }
};

const getRecommendations = async (userId: number, limit = 10, offset = 0) => {
    if (!(await verifyUser())) {
        unauthorized();
    }
    try {
        const result = await pool.request()
            .input("userId", userId)
            .input("limit", limit)
            .input("offset", offset)
            .query(`
                WITH UserFriends AS (
                    SELECT CASE WHEN followerId = @userId THEN followingId ELSE followerId END AS friendId
                    FROM Follow
                    WHERE (followerId = @userId OR followingId = @userId) AND isAccepted = 1
                ),
                Candidates AS (
                    SELECT a.id AS candidateId, a.username, up.fullName, up.imgUrl, up.location, up.homeTown
                    FROM Account a
                    LEFT JOIN UserProfile up ON up.accountId = a.id
                    WHERE a.id <> @userId AND a.id NOT IN (SELECT friendId FROM UserFriends)
                ),
                CandidateFriends AS (
                    SELECT c.candidateId, CASE WHEN f.followerId = c.candidateId THEN f.followingId ELSE f.followerId END AS friendOfCandidate
                    FROM Candidates c
                    JOIN Follow f ON (f.followerId = c.candidateId OR f.followingId = c.candidateId) AND f.isAccepted = 1
                ),
                SharedCount AS (
                    SELECT cf.candidateId, COUNT(DISTINCT cf.friendOfCandidate) AS sharedFriends
                    FROM CandidateFriends cf
                    JOIN UserFriends uf ON uf.friendId = cf.friendOfCandidate
                    GROUP BY cf.candidateId
                )
                SELECT c.candidateId AS id, c.username, c.fullName, c.imgUrl, c.location, c.homeTown,
                       ISNULL(sc.sharedFriends, 0) AS sharedFriends,
                       CASE WHEN c.location IS NOT NULL AND c.location = upUser.location THEN 1 ELSE 0 END AS sameLocation,
                       CASE WHEN c.homeTown IS NOT NULL AND c.homeTown = upUser.homeTown THEN 1 ELSE 0 END AS sameHomeTown
                FROM Candidates c
                LEFT JOIN SharedCount sc ON sc.candidateId = c.candidateId
                LEFT JOIN UserProfile upUser ON upUser.accountId = @userId
                ORDER BY ISNULL(sc.sharedFriends,0) DESC,
                         CASE WHEN c.location = upUser.location THEN 1 ELSE 0 END DESC,
                         CASE WHEN c.homeTown = upUser.homeTown THEN 1 ELSE 0 END DESC
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
            `);
        return {
            success: true,
            data: result.recordset
        };
    } catch (error) {
        console.error("getRecommendations error:", error);
        return { success: false, message: "Hệ thống gặp sự cố, vui lòng thử lại sau!" };
    }
};

export { sendInvite, acceptInvite, removeFriend, getStatusFriend, cancelInvite, getFriendsList, getInvitesReceived, getRecommendations };