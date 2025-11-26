"use client"
import { useUser } from '@/context/AuthContext'
import { redirect, unauthorized, useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

export default function PrivateRoute({ children, allowedRoles = [], className = '' }) {
    const { authen, loading, user } = useUser();
    const router = useRouter();
    useEffect(() =>  {
        if (loading) return;
        if (!authen) {
            window.location.href = '/login';
        }
        if (user && !user?.isActive) {
            router.push('/banned');
        }
        if (user?.role && user && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
            unauthorized();
        }
    }, [authen, loading, router, allowedRoles, user]);
    return (
        <div className={className}>
            {children}
        </div>
    )
}
