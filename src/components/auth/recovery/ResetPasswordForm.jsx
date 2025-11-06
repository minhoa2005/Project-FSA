"use client"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import React, { useEffect, useState } from 'react'
import { MailWarning } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function ResetPasswordForm({ submit }) {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            setLoading(false);
            return;
        }
        const formData = new FormData(e.target);
        try {
            const response = await submit(formData);
            if (response.success) {
                toast.success('Password reset successful. You can login now.');
                router.push('/login');
            }
            else {
                toast.error('Password reset failed. Please try again.');
                router.push('/login');
            }
        }
        catch (error) {
            toast.error('Password reset failed. Please try again.');
            router.push('/login');
        }
        finally {
            setLoading(false);
            setPassword('');
            setConfirmPassword('');
        }
    }
    return (
        <div className='flex items-center justify-center min-h-screen'>
            <Card className='w-full max-w-md mx-auto'>
                <CardHeader>
                    <CardTitle>Recovery Account</CardTitle>
                    <CardDescription>Set your new password</CardDescription>
                </CardHeader>
                <CardContent>
                    <form id='reset-password' onSubmit={(e) => handleSubmit(e)}>
                        <div className='flex flex-col gap-3'>
                            <div>
                                <Input type="password" placeholder="New Password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <div>
                                <Input type="password" placeholder="Confirm Your Password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value) }} />
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter>
                    <Button type="submit" form="reset-password" className="w-full" disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
