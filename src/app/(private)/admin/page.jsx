"use client"
import { Button } from '@/components/ui/button'
import { useUser } from '@/context/AuthContext'
import React from 'react'

export default function page() {
    const { handleLogout } = useUser();

    return (
        <div>
            <Button onClick={handleLogout} variant={'outline'} >Logout</Button>
        </div>
    )
}
