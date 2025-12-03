"use client"
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { handleRegister } from '@/service/public/auth/auth';
import { validateEmail, validateFullName, validatePassword } from '@/lib/validators';

export default function RegisterForm({ action }) {
    const router = useRouter();
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        try {
            const checkEmail = validateEmail(formData.get('email') as string);
            if (checkEmail) {
                toast.error(checkEmail, { duration: 4000 });
                return;
            }
            const checkPassword = validatePassword(formData.get('password') as string);
            if (checkPassword) {
                toast.error(checkPassword, { duration: 4000 });
                return;
            }
            const checkName = validateFullName(formData.get('fullName') as string);
            if (checkName) {
                toast.error(checkName, { duration: 4000 });
                return;
            }
            const response = await handleRegister(formData);
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
        <div className='flex-1 flex items-center justify-center'>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle >Đăng ký tài khoản</CardTitle>
                    <CardDescription>Nhập email và mật khẩu của bạn để đăng ký</CardDescription>
                </CardHeader>
                <CardContent>
                    <form id="register-form" onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="fullName">Họ và tên</Label>
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    placeholder="Nguyen Van A"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="username">Tên đăng nhập</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                />
                            </div>
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
                                <Label htmlFor="password">Mật khẩu</Label>
                                <Input id="password" type="password" name="password" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                                <Input id="confirmPassword" type="password" name="confirmPassword" required />
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <Button className="w-full" variant="outline" type="submit" form="register-form">
                        Đăng ký
                    </Button>
                    <p>Đã có tài khoản? <a href="/login" className="text-blue-500 hover:underline">Đăng nhập</a></p>
                </CardFooter>
            </Card>
        </div>
    )
}
