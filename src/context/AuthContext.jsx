"use client"
import React, { createContext, useContext, useState } from 'react'

const userContext = createContext();

export default function AuthContext({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [authen, setAuthen] = useState(false);
    const [error, setError] = useState(null);



    return (
        <userContext.Provider value={{ user, setUser, loading, setLoading, authen, setAuthen, error, setError }}>
            {children}
        </userContext.Provider>
    )
}

export const useUser = () => {
    const context = useContext(userContext);
    if (!context) {
        throw new Error("no context");
    }
    return context;
}
