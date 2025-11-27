import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function InfoSectionSkeleton({ className }: { className?: string }) {
    return (
        <Card className={`${className}`}>
            <CardHeader>
                <CardTitle className='text-2xl'>Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent>
                <div className=''>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-10 w-full mb-4" />
                </div>
                <div>
                    <Skeleton className="h-4 w-28 mb-1" />
                    <Skeleton className="h-10 w-full mb-4" />
                </div>
                <div>
                    <Skeleton className="h-4 w-28 mb-1" />
                    <Skeleton className="h-10 w-full mb-4" />
                </div>
                <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-10 w-full mb-4" />
                </div>
            </CardContent>
            <CardFooter className='flex justify-end'>
                <Skeleton className="h-10 w-40" />
            </CardFooter>
        </Card>
    )
}