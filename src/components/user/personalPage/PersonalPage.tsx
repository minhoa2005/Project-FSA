"use client"
import { Avatar } from '@/components/ui/avatar'
import { useUser } from '@/context/AuthContext'
import { getInitials } from '@/lib/formatter'
import { AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import Image from 'next/image'
import React from 'react'
import CoverSection from './CoverSection'

export default function PersonalPage() {
    const { user } = useUser();
    return (
        <div>
            <CoverSection user={user} />
        </div>
    )
}
