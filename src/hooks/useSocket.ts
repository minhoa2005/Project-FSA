// hooks/useSocket.js (Đã sửa lại, sử dụng Singleton và State)

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

let socketInstance = null; 

export function useSocket(userId?: number) {
  const [socket, setSocket] = useState(socketInstance); 

  useEffect(() => {
    if (!socketInstance) {
        socketInstance = io("http://localhost:3000", {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
            transports: ['websocket', 'polling']
        });
        
        socketInstance.on("connect", () => {
            console.log("✅ Socket connected:", socketInstance.id);
            // Emit user login event để server biết user này online
            if (userId) {
                socketInstance.emit("user_login", userId);
            }
        });

        socketInstance.on("connect_error", (err) => {
            console.error("❌ Socket connection error:", err);
        });

        socketInstance.on("disconnect", () => {
            console.log("⚠️ Socket disconnected");
        });
        
        setSocket(socketInstance); 
    }
    
  }, [userId]);

  return socket; 
}