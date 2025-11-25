"use client"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { getInitials } from '@/lib/formatter'
import React, { useRef, useState } from 'react'
import type { Blob } from 'buffer'
import { toast } from 'sonner'

export default function AvatarSection({ className }: { className?: string }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLInputElement>(null);
    const [imageSrc, setImageSrc] = useState<string | ArrayBuffer | null>(null);
    const [crop, setCrop] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const onFileChange = () => {
        const file = ref.current.files[0];
        if (file.size > 15 * 1024 * 1024) {
            toast.error("Kích thước ảnh vượt quá 15MB");
            ref.current.value = null;
            return;
        }
        if (!file.type.startsWith("image/")) {
            toast.error("Vui lòng chọn tệp ảnh hợp lệ (PNG, JPEG, ...)");
            ref.current.value = null;
            return;
        }
        const reader = new FileReader();
        if (file) {
            reader.onload = () => {
                setImageSrc(reader.result);
                setOpen(true);
            }
            reader.readAsDataURL(file);
        }
    }

    const saveAvatar = () => {

    }
    return (
        <div>
            <Card className={`${className}`}>
                <CardContent className='flex justify-between gap-4 items-center'>
                    <div className='flex gap-2 items-center mt-5'>
                        <Avatar className="w-32 h-32">
                            <AvatarImage src="/avatar.png" alt="User Avatar" />
                            <AvatarFallback>{getInitials("Minh")}</AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col gap-1' >
                            <p>Ảnh đại diện</p>
                            <p className='text-zinc-400 text-sm' >PNG, JPEG dưới 15MB</p>
                        </div>
                    </div>
                    <div className='flex  gap-2 justify-center' >
                        <Button className={'cursor-pointer'} onClick={() => ref.current.click()}>Đăng tải ảnh</Button>
                        <Button variant="outline" className={'cursor-pointer'}>Xóa</Button>
                    </div>
                    <Input type='file' className='hidden' accept="image/*" ref={ref} onChange={onFileChange} />
                </CardContent>
            </Card>
            <Dialog open={open} onOpenChange={(state) => {
                setOpen(state);
                if (!state) {
                    setImageSrc(null);
                    ref.current.value = null;
                }
            }} >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chọn ảnh đại diện</DialogTitle>
                        <DialogDescription>Chỉnh sửa ảnh</DialogDescription>
                    </DialogHeader>
                    <div>
                        <Avatar className="w-32 h-32 mx-auto mb-4">
                            <AvatarImage src={imageSrc as string} alt="User Avatar" />
                            <AvatarFallback>{getInitials("Minh")}</AvatarFallback>
                        </Avatar>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setOpen(false); setImageSrc(null); ref.current.value = null; }}>Hủy</Button>
                        <Button>Lưu</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
