"use client"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { validatePassword } from '@/lib/validators'
import { changePassword } from '@/service/users/personalInfo'
import React, { useState } from 'react'
import { toast } from 'sonner'

export default function PasswordSection({ className }: { className?: string }) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const handleUpdatePassword = async () => {
        try {
            setLoading(true);
            const checkPassword = validatePassword(newPassword);
            if (checkPassword) {
                toast.error(checkPassword);
                setLoading(false);
                return;
            }
            if (confirmPassword !== newPassword) {
                toast.error('Mật khẩu xác nhận không khớp');
                setLoading(false);
                return;
            }
            const response = await changePassword(oldPassword, newPassword);
            if (response.success) {
                toast.success('Cập nhật mật khẩu thành công');
            }
            else {
                toast.error(response.message || 'Đã có lỗi xảy ra khi cập nhật mật khẩu');
            }
        }
        catch (error) {
            console.error('Error updating password:', error);
            toast.error('Đã có lỗi xảy ra khi cập nhật mật khẩu');
        }
        finally {
            setNewPassword('');
            setOldPassword('');
            setConfirmPassword('');
            setLoading(false);
        }
    }
    return (
        <Card className={`${className}`}>
            <CardHeader>
                <CardTitle className='text-2xl'>Đổi mật khẩu</CardTitle>
            </CardHeader>
            <CardContent>
                <div className='flex flex-col gap-2'>
                    <Label>Mật khẩu hiện tại</Label>
                    <Input type="password" placeholder="" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="mt-1 mb-4" />
                </div>
                <div className='flex flex-col gap-2'>
                    <Label>Mật khẩu mới</Label>
                    <Input type="password" placeholder="" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 mb-4" />
                </div>
                <div className='flex flex-col gap-2'>
                    <Label>Xác nhận mật khẩu mới</Label>
                    <Input type="password" placeholder="" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 mb-4" />
                </div>
            </CardContent>
            <CardFooter className='flex justify-end' >
                <Button className='cursor-pointer' disabled={loading} onClick={handleUpdatePassword}>Cập Nhật Mật Khẩu</Button>
            </CardFooter>
        </Card>
    )
}
