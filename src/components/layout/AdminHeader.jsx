"use client"

import { usePathname, useRouter } from 'next/navigation'
import React from 'react'
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { formatName, getInitials } from '@/lib/formatter';

export default function AdminHeader() {
    const params = usePathname();
    const router = useRouter();
    const getPath = () => {
        const paths = params.split('/');
        return paths[paths.length - 1]
    }
    return (
        <div className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
            <Button size={'sm'} variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className=" h-4 w-4" />
                Back
            </Button>
            <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-6"
            />
            <h1 className='text-2xl' >{formatName(getPath())}</h1>
        </div>
    )
}
