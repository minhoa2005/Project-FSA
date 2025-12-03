import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { addAccByAdmin, getAllEmail, getAllUser, getAllUsername } from '@/service/admin/accountManager'
import { toast } from 'sonner'
import { sendAccCreateByAdminToCus } from '@/config/emailService'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../ui/breadcrumb'
import Link from 'next/link'
import { SlashIcon } from 'lucide-react'
import BreadcrumbAdmin from './Breadcrumb'
import { validateEmail, validateFullName, validatePassword } from '@/lib/validators'

export default function AccCreate() {

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const data = new FormData(e.currentTarget);

        const fullName = data.get('fullName') as string
        const username = data.get('username') as string
        const email = data.get('email') as string
        const password = data.get('password') as string
        const confirmPassword = data.get('confirmPassword') as string

        try {
            if (password !== confirmPassword) {
                toast.error('Mật khẩu không khớp')
                return;
            }

            const checkEmail = validateEmail(email) 
            if (checkEmail) {
                toast.error('Email không hợp lệ')
                return
            }

            const checkPassword = validatePassword(password)
            if(checkPassword) {
                toast.error('Mật khẩu không hợp lệ')
                return
            }

            const checkFullname = validateFullName(fullName) 
            if(checkFullname) {
                toast.error('Tên không hợp lệ')
                return
            }

            const allEmail = await getAllEmail();
            if (allEmail) {
                // console.log(allEmail)
                if (allEmail.some(em => em.email === email)) {
                    toast.error('Email đã tồn tại')
                    return;
                }
            }

            const allUsername = await getAllUsername()
            if (allUsername) {
                if (allUsername.some(u => u.username === username)) {
                    toast.error('Tên đăng nhập đã tồn tại')
                    return;
                }
            }

            const addAccount = await addAccByAdmin(fullName, email, username, password)
            if (addAccount.success) {
                sendAccCreateByAdminToCus(email, password)
                toast.success('Tạo tài khoản thành công và thông báo tới tài khoản email người dùng!')

            } else {
                toast.error("Lỗi tạo tài khoản!")
            }
        } catch (err) {
            console.log('err create acc by admin', err)
        }


    }

    return (
        <div>
            <BreadcrumbAdmin />
            <div className='flex items-center justify-center'>
                <div className='flex-1 flex items-center justify-center'>
                    <Card className="w-200 border-0 shadow-none">
                        <CardHeader>
                            <CardTitle >Tạo tài khoản cho người dùng</CardTitle>
                            <CardDescription>Nhập email và mật khẩu của người dùng để đăng ký</CardDescription>
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
                                Tạo tài khoản
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div >
        </div >
    )
}
