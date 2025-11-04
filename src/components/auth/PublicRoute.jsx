"use client"
import { useUser } from '@/context/AuthContext'
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PublicRoute({ children }) {
    const router = useRouter();
    const { user, loading, authen } = useUser();
    useEffect(() => {
        if (loading) return;
        if (!authen) {
            router.push('/login');
        }
    }, [loading, authen]);
    return (
        <div>
            {children}
        </div>
    )
}
