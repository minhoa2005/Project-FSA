"use client"
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function RegisterForm({ action }) {
    const router = useRouter();
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            const response = await action(formData);
            if (response.success) {
                toast.success('Registration successful! Please log in.', { duration: 4000 });
                router.push('/login');
            } else {
                toast.error(response.message || 'Registration failed. Please try again.', { duration: 4000 });
                router.push('/register');
            }
        } catch (error) {
            toast.error('An unexpected error occurred. Please try again later.', { duration: 4000 });
            console.error(error);
        }
    };
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
                        <form id="register-form" onSubmit={handleSubmit}>
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
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" type="password" name="password" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="confirmPassword">Confirm password</Label>
                                    <Input id="confirmPassword" type="password" name="confirmPassword" required />
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button className="w-full" variant="outline" type="submit" form="register-form">
                            Register
                        </Button>
                        <p>Already have an account? <a href="#" className="text-blue-500 hover:underline">Login</a></p>
                    </CardFooter>
                </Card>
            </div>
        </div >
    )
}
