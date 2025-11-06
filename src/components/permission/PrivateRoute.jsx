"use client"
import { useUser } from '@/context/AuthContext'
import { unauthorized, useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

export default function PrivateRoute({ children, allowedRoles = [] }) {
    const { authen, loading, user } = useUser();
    const router = useRouter();
    useEffect(() => {
        if (loading) return;
        if (!authen) {
            router.push('/login');
        }
        if (user?.role && user && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
            unauthorized();
        }
    }, [authen, loading, router, allowedRoles, user]);
    return (
        <div>
            {children}
        </div>
    )
}
