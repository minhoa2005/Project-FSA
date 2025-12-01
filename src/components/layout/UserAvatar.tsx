"use client"
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { getInitials } from '@/lib/formatter'
import { useUser } from '@/context/AuthContext'

export default function UserAvatar({ className }: { className?: string }) {
    const { user } = useUser()
    return (
        <Avatar className={className}>
            <AvatarImage src={''} alt="User Avatar" />
            <AvatarFallback>{getInitials(user?.username)}</AvatarFallback>
        </Avatar>
    )
}
