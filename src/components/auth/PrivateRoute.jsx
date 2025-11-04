"use client"
import { useUser } from '@/context/AuthContext'
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

export default function PrivateRoute({ children, allowedRoles = [] }) {
    const { authen, loading, user } = useUser();
    const router = useRouter();
    useEffect(() => {
        if (loading) return;
        if (!authen) {
            router.push('/login');
        }
        else if (authen && !allowedRoles.includes(user.role)) {
            router.push('/');
        }
    }, [authen, loading, router, allowedRoles, user]);
    if (loading) return <div>Loading...</div>;
    if (!authen) return null;
    if (allowedRoles && !hasRole(allowedRoles)) return null;
    return (
        <div>
            {children}
        </div>
    )
}
