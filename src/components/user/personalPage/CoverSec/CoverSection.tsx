import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { getInitials } from '@/lib/formatter'
import Image from 'next/image'
import React, { use } from 'react'
import FollowButton from './FollowButton'

export default function CoverSection({ className, user, watcherId, userId }: { className?: string, user: any, watcherId: number, userId: number }) {
    return (
        <div className='grid grid-rows-2'>
            <div className={`flex justify-center mt-2 ${className}`}>
                <div className='w-[70%] h-90 relative rounded' >
                    <Image src={user?.coverImg || '/defaultCoverImg.jpg'}
                        alt="Personal Image"
                        layout="fill"
                        objectFit='cover'
                        className='rounded'
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
            {userId !== watcherId && (
                <div className='w-[70%] justify-self-center flex justify-end' >
                    <FollowButton watcherId={watcherId} id={userId} className="mr-10 mt-6 cursor-pointer hover:scale-110 hover:shadow-xl ease-in-out duration-300 transition-all" />
                </div>
            )}
        </div>
    )
}
