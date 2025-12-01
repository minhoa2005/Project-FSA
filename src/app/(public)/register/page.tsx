import RegisterForm from '@/components/auth/RegisterForm'
import { handleRegister } from '@/service/public/auth/auth'
import React from 'react'

export default function page() {
    return (
        <div className='flex items-center justify-center h-screen'>
            <div className='flex-1 flex flex-col items-center justify-center'>
                <h1 className='text-[100px]'>BlogG</h1>
                <p className='text-[20px]'>Share your moment</p>
            </div>
            <RegisterForm action={handleRegister} />
        </div>
    )
}
