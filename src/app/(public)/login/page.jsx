import LoginForm from '@/components/auth/LoginForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { handleLogin } from '@/service/public/auth/auth'
import { DivideCircle } from 'lucide-react'
import React from 'react'

export default function page() {

    return (
        <div>
            <LoginForm action={handleLogin} />
        </div >
    )
}
