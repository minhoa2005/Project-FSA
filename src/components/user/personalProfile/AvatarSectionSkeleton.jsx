import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function AvatarSectionSkeleton({ className }) {
    return (
        <Card className={`${className}`}>
            <CardContent className='flex justify-between gap-4 items-center'>
                <div className='flex gap-2 items-center mt-5'>
                    <Skeleton className="w-32 h-32 rounded-full" />
                    <div className='flex flex-col gap-1'>
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                </div>
                <div className='flex gap-2 justify-center'>
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </CardContent>
        </Card>
    )
}