import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// Khởi tạo app Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    // Tạo HTTP Server thủ công
    const httpServer = createServer(async (req, res) => {
        try {
            // 1. Parse URL
            const parsedUrl = parse(req.url, true);

            // 2. Chuyển request cho Next.js xử lý
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error("Lỗi xảy ra khi xử lý request:", err);
            res.statusCode = 500;
            res.end("Internal Server Error");
        }
    });

    // 3. Tích hợp Socket.IO
    const io = new Server(httpServer);

    io.on("connection", (socket) => {
        console.log("Client kết nối: " + socket.id);

        socket.on("send-message", (msg) => {
            io.emit("receive-message", msg);
        });

        socket.on("disconnect", () => {
            console.log("Client ngắt kết nối");
        });
    });

    // 4. Lắng nghe port
    httpServer.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});
