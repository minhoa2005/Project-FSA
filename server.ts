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
