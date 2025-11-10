"use client"
import { useUser } from '@/context/AuthContext'
import React from 'react'
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { LogOutIcon } from 'lucide-react';

export default function LogOutComponent() {
    const { logout } = useUser();
    const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    }
    return (
        <DropdownMenuItem onClick={handleLogout}>
            <LogOutIcon />
            <span>Logout</span>
        </DropdownMenuItem>
    )
}
