import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import Image from 'next/image'
import React from 'react'

export default function CoverImageSection({ className }: { className?: string }) {
    return (
        <Card className={className}>
            <CardContent className='flex items-center justify-between h-full gap-4'>
                <div className='flex gap-2 items-center h-full'>
                    <Image src={'https://plus.unsplash.com/premium_photo-1673177667569-e3321a8d8256?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y292ZXIlMjBwaG90b3xlbnwwfHwwfHx8MA%3D%3D'}
                        alt='coverImage' width={160} height={61} className='rounded' />
                    <div className='flex flex-col gap-1' >
                        <p>Ảnh nền</p>
                        <p className='text-zinc-400 text-sm' >PNG, JPEG dưới 15MB</p>
                    </div>
                </div>
                <div className='flex flex-col gap-2 justify-center' >
                    <Button className={'cursor-pointer'} >Đăng tải ảnh</Button>
                    <Button variant="outline" className={'cursor-pointer'}>Xóa</Button>
                </div>
            </CardContent>
        </Card>
    )
}
