import RegisterForm from '@/components/auth/RegisterForm'
import { handleRegister } from '@/service/public/auth/auth'
import React from 'react'

export default function page() {
    return (
        <div>
            <RegisterForm action={handleRegister} />
        </div>
    )
}
