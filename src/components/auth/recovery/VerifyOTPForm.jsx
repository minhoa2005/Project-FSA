import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import React from 'react'

export default function VerifyOTPForm() {
    const handleSubmit = async (e) => {

    }
    return (
        <div className='flex min-h-screen items-center justify-center'>
            <Card className='w-full max-w-md mx-auto'>
                <CardHeader>
                    <CardTitle>Recover Password</CardTitle>
                    <CardDescription>Verify your OTP</CardDescription>
                </CardHeader>
                <CardContent>
                    <form id='verify-otp' onSubmit={handleSubmit} >
                        <Input type="text" placeholder="Enter your OTP" name="otp" />
                    </form>
                </CardContent>
                <CardFooter>
                    <Button type="submit" form="verify-otp" className="w-full" disabled={isPending}>{isPending ? 'Verifying...' : 'Verify OTP'}</Button>
                </CardFooter>
            </Card>
        </div>
    )
}
