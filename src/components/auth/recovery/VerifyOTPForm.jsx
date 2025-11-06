"use client"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'

export default function VerifyOTPForm({ submit }) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsPending(true);
        try {
            const formData = new FormData(e.target);
            const response = await submit(formData);
            if (response.success) {
                setIsPending(false);
                router.push('/recovery/new-password');
                // toast.success('OTP verified successfully');
            }
            else {
                setIsPending(false);
                toast.error(response.message || 'Failed to verify OTP');
            }
        } catch (error) {
            setIsPending(false);
            toast.error('An error occurred while verifying OTP');
        }
    }
    return (
        <div className='flex min-h-screen items-center justify-center'>
            <Card className='w-full max-w-md mx-auto'>
                <CardHeader>
                    <CardTitle>Recover Account</CardTitle>
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
