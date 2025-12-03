import { createServer, IncomingMessage, ServerResponse } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// Store user socket mappings for notifications
const userSockets = new Map();

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
        try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error("Lỗi xảy ra khi xử lý request:", err);
            res.statusCode = 500;
            res.end("Internal Server Error");
        }
    });

    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket: any) => {
        console.log("✅ Client kết nối: " + socket.id);

        // User login - lưu mapping socket
        socket.on("user_login", (userId) => {
            userSockets.set(userId, socket.id);
            console.log(`User ${userId} mapped to socket ${socket.id}`);
            socket.userId = userId;
        });

        // Join room để chat với người cụ thể
        socket.on("join_room", (roomId) => {
            socket.join(roomId);
            console.log(`Socket ${socket.id} joined room ${roomId}`);
        });

        // Nhận tin nhắn và gửi trong room (không gửi lại cho người gửi)
        socket.on("send_message", (msg) => {
            if (msg.roomId) {
                socket.broadcast.to(msg.roomId).emit("receive_message", msg);
                
                // Gửi notification cho receiver nếu không online ở room đó
                if (msg.receiverId && userSockets.has(msg.receiverId)) {
                    io.to(userSockets.get(msg.receiverId)).emit("new_message_notification", {
                        senderId: msg.senderId,
                        senderName: msg.senderName,
                        roomId: msg.roomId,
                        preview: msg.text?.substring(0, 50),
                        timestamp: new Date()
                    });
                }
            } else {
                socket.broadcast.emit("receive_message", msg);
            }
        });

        // Mark tin nhắn đã đọc
        socket.on("mark_as_read", (roomId) => {
            io.to(roomId).emit("messages_read", { roomId });
        });

        // Delete message - broadcast to room
        socket.on("delete_message", (msgId) => {
            socket.broadcast.emit("message_deleted", msgId);
        });

        // Legacy support
        socket.on("send-message", (msg) => {
            io.emit("receive-message", msg);
        });

        // --- THÊM ĐOẠN NÀY VÀO (Logic Comment) ---
        
        /// 1. Join Room bài viết
        socket.on("join_post", (postId: any) => {
            const roomName = `post_${postId}`;
            socket.join(roomName);
            // console.log(`Socket ${socket.id} joined ${roomName}`);
        });

        // 2. Broadcast Comment Mới
        socket.on("new_comment_posted", (data: any) => {
            const { room, comment } = data;
            io.to(room).emit("receive_comment", comment);
        });

        // 3. Broadcast Like Bài Viết
        socket.on("update_post_like_stats", (data: any) => {
            // data: { room, likes }
            // Gửi cho người khác (trừ người gửi)
            socket.to(data.room).emit("sync_post_likes", { likes: data.likes });
        });

        // 4. Broadcast Like Comment
        socket.on("update_comment_like_stats", (data: any) => {
            // data: { room, commentId, likes }
            socket.to(data.room).emit("sync_comment_likes", { 
                commentId: data.commentId, 
                likes: data.likes 
            });
        });

        // 5. Xử lý Ẩn/Hiện Comment (Realtime)
        socket.on("toggle_hide_comment", (data: any) => {
            // data: { room, commentId }
            // Báo cho mọi người trong phòng biết commentId này vừa thay đổi trạng thái ẩn/hiện
            socket.to(data.room).emit("sync_hide_comment", { 
                commentId: data.commentId 
            });
        });

        // ==========================================
        // 6. SHARE FUNCTIONALITY (NEW)
        // ==========================================
        
        // Broadcast khi có bài viết mới được share
        socket.on("post_shared", (data: any) => {
            // data: { originalPostId, newPostId, sharerInfo }
            const { originalPostId, newPostId, sharerInfo } = data;
            
            // Gửi notification cho người tạo bài viết gốc
            if (sharerInfo.originalCreatorId && userSockets.has(sharerInfo.originalCreatorId)) {
                io.to(userSockets.get(sharerInfo.originalCreatorId)).emit("share_notification", {
                    type: "post_shared",
                    sharerName: sharerInfo.sharerName,
                    sharerAvatar: sharerInfo.sharerAvatar,
                    originalPostId,
                    newPostId,
                    timestamp: new Date()
                });
            }

            // Broadcast cập nhật số lượng share cho bài viết gốc
            io.to(`post_${originalPostId}`).emit("sync_share_count", {
                postId: originalPostId,
                shareCount: sharerInfo.newShareCount
            });

            // Broadcast bài viết mới được share tới feed chung
            io.emit("new_shared_post", {
                postId: newPostId,
                originalPostId,
                sharerId: sharerInfo.sharerId
            });
        });

        // Cập nhật số lượng share realtime
        socket.on("update_share_count", (data: any) => {
            // data: { postId, shareCount }
            io.to(`post_${data.postId}`).emit("sync_share_count", {
                postId: data.postId,
                shareCount: data.shareCount
            });
        });

        // Xóa bài share
        socket.on("shared_post_deleted", (data: any) => {
            // data: { sharedPostId, originalPostId, newShareCount }
            io.to(`post_${data.originalPostId}`).emit("sync_share_count", {
                postId: data.originalPostId,
                shareCount: data.newShareCount
            });

            io.emit("post_deleted", { postId: data.sharedPostId });
        });

        
        
        
        // ------------------------------------------

        socket.on("disconnect", () => {
            // Xóa user mapping khi disconnect
            if (socket.userId) {
                userSockets.delete(socket.userId);
                console.log(`⚠️ User ${socket.userId} disconnected`);
            }
            console.log("⚠️ Client ngắt kết nối: " + socket.id);
        });
    });

    httpServer.on("error", (err) => {
        console.error("Server error:", err);
    });

    httpServer.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});
