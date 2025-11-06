
"use client"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function GetOTPForm({ submit }) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsPending(true);
        const formData = new FormData(e.target);
        try {
            const response = await submit(formData);
            if (response.success) {
                toast.success('OTP sent successfully! Please check your email.', { duration: 4000 });
                setTimeout(() => {
                    router.push('/recovery/verify');
                }, 1000);
            } else {
                toast.error(response.message || 'Failed to send OTP. Please try again.', { duration: 4000 });
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred. Please try again.', { duration: 4000 });
        } finally {
            setIsPending(false);
        }
    }
    return (
        <div className='flex min-h-screen items-center justify-center'>
            <Card className='w-full max-w-md mx-auto'>
                <CardHeader>
                    <CardTitle>Recover Password</CardTitle>
                    <CardDescription>Enter your email to get OTP</CardDescription>
                </CardHeader>
                <CardContent>
                    <form id='email' onSubmit={handleSubmit} >
                        <Input type="email" placeholder="Enter your email" name="email" />
                    </form>
                </CardContent>
                <CardFooter>
                    <Button type="submit" form="email" className="w-full" disabled={isPending}>{isPending ? 'Sending...' : 'Send OTP'}</Button>
                </CardFooter>
            </Card>
        </div>
    )
}
