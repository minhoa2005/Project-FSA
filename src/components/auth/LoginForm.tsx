"use client"
import React, { use, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useUser } from '@/context/AuthContext'
import { toast } from 'sonner'
import { handleLogin } from '@/service/public/auth/auth'
import { validateEmail, validatePassword } from '@/lib/validators'


export default function LoginForm() {
    const { setUser, setAuthen, setLoading, loading } = useUser();
    useEffect(() => {
        if (loading) return;
    }, [loading])
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        try {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            let emailCheck = validateEmail(formData.get('email') as string);
            if (emailCheck) {
                toast.error(emailCheck, { duration: 4000 });
                return;
            }
            // let passwordCheck = validatePassword(formData.get('password') as string);
            // if (passwordCheck) {
            //     toast.error(passwordCheck, { duration: 4000 });
            //     return;
            // }
            const response = await handleLogin(formData);
            if (response.success) {
                localStorage.setItem("userId", String(response.user.id));
                console.log("cc" + response.user.id)
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

        <div className='flex-1 flex items-center justify-center'>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle >Đăng nhập</CardTitle>
                    <CardDescription>Nhập email và mật khẩu của bạn để đăng nhập</CardDescription>
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
                                    <Label htmlFor="password">Mật khẩu</Label>
                                    <a
                                        href="/recovery"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        Quên mật khẩu?
                                    </a>
                                </div>
                                <Input id="password" type="password" name="password" required />
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <Button type="submit" form="login-form" className="w-full cursor-pointer">
                        Đăng nhập
                    </Button>
                    <Button className="w-full" variant="outline" onClick={() => {
                        window.location.href = '/register';
                    }}>
                        Đăng ký
                    </Button>
                </CardFooter>
            </Card>
        </div>

    )
}
