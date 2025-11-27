import React from 'react'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

export default function ChangePassAdmin() {
    return (
        <div>
            <Sheet>
                <SheetTrigger asChild>
                    <span className='flex px-2 py-1.5 text-sm hover:bg-gray-100 rounded dark:hover:bg-[#262626]'>Đặt mật khẩu</span>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Đặt mật khẩu</SheetTitle>
                        <SheetDescription>
                            xxx
                        </SheetDescription>
                    </SheetHeader>
                    <div className="grid flex-1 auto-rows-min gap-6 px-4">
                        <div className="grid gap-3">
                            <Label htmlFor="sheet-demo-name">Mật khẩu cũ</Label>
                            <Input id="old-password" type='password' />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="sheet-demo-username">Mật khẩu mới</Label>
                            <Input id="new-password" type='password' />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="sheet-demo-username">Xác nhận mật khẩu mới</Label>
                            <Input id="re-new-password" type='password' />
                        </div>
                    </div>
                    <SheetFooter>
                        <Button type="submit">Lưu</Button>
                        <SheetClose asChild>
                            <Button variant="outline">Hủy</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    )
}
