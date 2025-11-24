import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getInitials } from '@/lib/formatter'
import React from 'react'

export default function AvatarSection({ className }: { className?: string }) {
    return (
        <Card className={`${className}`}>
            <CardContent className='flex justify-between gap-4 items-center' >
                <div className='flex gap-2 items-center mt-5'>
                    <Avatar className="w-32 h-32">
                        <AvatarImage src="/avatar.png" alt="User Avatar" />
                        <AvatarFallback>{getInitials("Minh")}</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col gap-1' >
                        <p>Ảnh đại diện</p>
                        <p className='text-zinc-400 text-sm' >PNG, JPEG dưới 15MB</p>
                    </div>
                </div>
                <div className='flex  gap-2 justify-center' >
                    <Button className={'cursor-pointer'}>Đăng tải ảnh</Button>
                    <Button variant="outline" className={'cursor-pointer'}>Xóa</Button>
                </div>
            </CardContent>
        </Card>
    )
}
