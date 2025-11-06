"use client"
import React, { use, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useUser } from '@/context/AuthContext'
import { toast } from 'sonner'

export default function LoginForm({ action }) {
    const { setUser, setAuthen, setLoading, loading } = useUser();
    useEffect(() => {
        if (loading) return;
    }, [loading])
    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            const formData = new FormData(e.target);
            const response = await action(formData);
            if (response.success) {
                setUser(response.user);
                setAuthen(true);
            } else {
                toast.error(response.message || 'Login failed. Please try again.', { duration: 4000 });
            }
        } catch (error) {
            toast.error(error.message || 'An unexpected error occurred. Please try again later.', { duration: 4000 });
            console.error(error);
        }
    }
    return (
        <div className='flex items-center justify-center h-screen'>
            <div className='flex-1 flex flex-col items-center justify-center'>
                <h1 className='text-[100px]'>BlogG</h1>
                <p className='text-[20px]'>Share your moment</p>
            </div>
            <div className='flex-1 flex items-center justify-center'>
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle >Login to your account</CardTitle>
                        <CardDescription>Enter your email and password to login</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form id="login-form" onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">Password</Label>
                                        <a
                                            href="/recovery"
                                            className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                        >
                                            Forgot your password?
                                        </a>
                                    </div>
                                    <Input id="password" type="password" name="password" required />
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button type="submit" form="login-form" className="w-full cursor-pointer">
                            Login
                        </Button>
                        <Button className="w-full" variant="outline" onClick={() => {
                            window.location.href = '/register';
                        }}>
                            Register
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div >
    )
}
