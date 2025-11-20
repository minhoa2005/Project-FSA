"use client"
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner';

const userContext = createContext();

export default function AuthContext({ children, authMe, logout }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authen, setAuthen] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();


    const auth = async () => {
        setLoading(true);
        try {
            const response = await authMe();
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

    const handleLogout = async () => {
        await logout();
        setUser(null)
        setAuthen(false)
        router.push('/login')
    }

    useEffect(() => {
        auth();
    }, []);

    return (
        <userContext.Provider value={{ user, setUser, loading, setLoading, authen, setAuthen, error, setError, logout, handleLogout }}>
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


