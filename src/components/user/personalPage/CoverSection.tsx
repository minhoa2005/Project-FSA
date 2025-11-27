import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { getInitials } from '@/lib/formatter'
import Image from 'next/image'
import React from 'react'

export default function CoverSection({ className, user }: { className?: string, user: any }) {
    return (
        <div className={`flex justify-center mt-2 ${className}`}>
            <div className='w-[70%] h-90 relative rounded' >
                <Image src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVyc29uYWwlMjBwYWdlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60"
                    alt="Personal Image"
                    layout="fill"
                    objectFit='cover'
                />
                <div className='absolute bottom-[-130px] left-5 grid grid-cols-2 gap-3' >
                    <Avatar className='w-40 h-40 border-4 border-primary'>
                        <AvatarImage src={user?.imgUrl} />
                        <AvatarFallback>{getInitials(user?.fullName)}</AvatarFallback>
                    </Avatar>
                    <div className='self-center flex flex-col'>
                        <p className='text-2xl font-semibold'>{user?.fullName}</p>
                        <p className='text-muted-foreground'>@{user?.username}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
