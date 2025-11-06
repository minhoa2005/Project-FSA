"use client"
import { useUser } from '@/context/AuthContext'
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PublicRoute({ children }) {
    const router = useRouter();
    const { user, loading, authen } = useUser();
    useEffect(() => {
        if (loading) return;
        if (authen) {
            if (user?.role === 'Admin') {
                router.push('/admin');
            }
            else {
                router.push('/')
            }
        }
    }, [loading, authen]);
    return (
        <div>
            {children}
        </div>
    )
}
