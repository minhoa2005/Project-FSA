"use client"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { changePassword } from '@/service/users/personalInfo'
import React, { useState } from 'react'

export default function PasswordSection({ className }) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const handleUpdatePassword = async () => {
        const response = await changePassword(oldPassword, newPassword);
    }
    return (
        <Card className={`${className}`}>
            <CardHeader>
                <CardTitle className='text-2xl'>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
                <div className='flex flex-col gap-2'>
                    <Label>Current Password</Label>
                    <Input type="password" placeholder="" className="mt-1 mb-4" />
                </div>
                <div className='flex flex-col gap-2'>
                    <Label>New Password</Label>
                    <Input type="password" placeholder="" className="mt-1 mb-4" />
                </div>
                <div className='flex flex-col gap-2'>
                    <Label>Confirm New Password</Label>
                    <Input type="password" placeholder="" className="mt-1 mb-4" />
                </div>
            </CardContent>
            <CardFooter className='flex justify-end' >
                <Button className='cursor-pointer'>Update Password</Button>
            </CardFooter>
        </Card>
    )
}
