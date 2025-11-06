"use client"
import React, { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner';

const userContext = createContext();

export default function AuthContext({ children, authMe, logout }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authen, setAuthen] = useState(false);
    const [error, setError] = useState(null);

    const auth = async () => {
        setLoading(true);
        try {
            const response = await authMe();
            console.log(response);
            if (response.success) {
                setUser(response.data);
                setAuthen(true);
            }
            else {
                setUser(null);
                setAuthen(false);
                await logout();
            }
        } catch (error) {
            toast.error('Failed to authenticate user. Please try again later.', { duration: 4000 });
            console.error('Authentication error:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        auth();
    }, []);

    return (
        <userContext.Provider value={{ user, setUser, loading, setLoading, authen, setAuthen, error, setError, logout }}>
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
