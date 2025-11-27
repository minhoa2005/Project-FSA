import React, { useState } from 'react'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { changePassAdmin, getAdminInfo } from '@/service/admin/admininfo'
import bcrypt from 'bcryptjs'
import { toast } from 'sonner'

export default function ChangePassAdmin() {
    const [err, setErr] = useState<string>('')

    const handleSubmit = async (e) => {
        e.preventDefault()

        const data = new FormData(e.target)

        const oldPass = data.get('oldPassword') as string
        const newPass = data.get('newPassword') as string
        const reNewPass = data.get('reNewPassword') as string

        const infoAdmin = await getAdminInfo()
        if(infoAdmin.success) {
            const pass = infoAdmin?.data?.password as string
            // console.log(pass)

            const checkPass = await bcrypt.compare(oldPass, pass);
            if (!checkPass) {
                // toast.error('Mật khẩu cũ sai!')
                setErr('Mật khẩu cũ sai!')
                return;
            }

            if(newPass !== reNewPass) {
                // toast.error('Mật khẩu mới không khớp!')
                setErr('Mật khẩu mới không khớp!')
                return;
            }

            const changePass = await changePassAdmin(newPass)
                if(changePass) {
                    setErr('Đổi mật khẩu thành công')
                } else {
                    setErr('Lỗi')
                }
        }

    }
    return (
        <div>
            <Sheet>
                <SheetTrigger asChild>
                    <span className='flex px-2 py-1.5 text-sm hover:bg-gray-100 rounded dark:hover:bg-[#262626]'>Đặt mật khẩu</span>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle className='text-lg'>Đặt mật khẩu</SheetTitle>
                        <SheetDescription>
                            Bạn cần xác nhận mật khẩu cũ trước khi cập nhật mật khẩu mới!
                        </SheetDescription>
                    </SheetHeader>
                    <form id='resetPass' onSubmit={handleSubmit}>
                        <div className="grid flex-1 auto-rows-min gap-6 px-4">
                            <div className="grid gap-3">
                                <Label htmlFor="old-password">Mật khẩu cũ</Label>
                                <Input id="old-password" type='password' name='oldPassword' required />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="new-password">Mật khẩu mới</Label>
                                <Input id="new-password" type='password' name='newPassword' required />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="re-new-password">Xác nhận mật khẩu mới</Label>
                                <Input id="re-new-password" type='password' name='reNewPassword' required />
                            </div>
                            <div className='italic text-sm text-red-500'>{err}</div>
                        </div>
                    </form>
                    <SheetFooter>
                        <Button form='resetPass' type="submit">Lưu</Button>
                        <SheetClose asChild>
                            <Button variant="outline">Hủy</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    )
}
