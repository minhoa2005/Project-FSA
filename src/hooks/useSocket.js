"use client";

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export function useSocket() {
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io("http://localhost:3000");
    console.log("cccc")
    return () => {
      socket.current.disconnect();
    };
  }, []);

  return socket.current;
}
