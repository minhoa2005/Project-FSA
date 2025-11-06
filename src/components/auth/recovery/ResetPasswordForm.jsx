import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import React from 'react'

export default function ResetPasswordForm() {

    return (
        <div className='flex items-center justify-center min-h-screen'>
            <Card className='w-full max-w-md mx-auto'>
                <CardHeader>
                    <CardTitle>Recovery Account</CardTitle>
                    <CardDescription>Set your new password</CardDescription>
                </CardHeader>
                <CardContent>
                    <form id='reset-password'>
                        <div>
                            <Input type="password" />
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
