import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

export default function unauthorized() {
    return (
        <div className='flex min-h-screen items-center justify-center'>
            <div className='flex justify-center flex-col items-center gap-3'>
                <h1>You are not allow to access this page</h1>
                <Link href={'/'}>
                    <Button variant="default">Back to Home</Button>
                </Link>
            </div>
        </div>
    )
}
