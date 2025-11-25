"use client"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { getInitials } from '@/lib/formatter'
import React, { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react'
import type { Blob } from 'buffer'
import { toast } from 'sonner'
import Cropper from 'react-easy-crop'
import { Slider } from '@/components/ui/slider'
import { updateAvatar } from '@/service/users/personalInfo'
import { useUser } from '@/context/AuthContext'


export default function AvatarSection({ className }: { className?: string }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLInputElement>(null);
    const [imageSrc, setImageSrc] = useState<string | ArrayBuffer | null>(null);
    const [crop, setCrop] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const { user, setUser } = useUser();
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
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

    const saveAvatar = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        try {
            const croppedDataUrl = await getCroppedImg(imageSrc as string, croppedAreaPixels);
            setAvatarUrl(croppedDataUrl);
            setOpen(false);
            setImageSrc(null);
            const result = await updateAvatar(croppedDataUrl);
            setUser((prev) => ({ ...prev, imgUrl: result.url }));
            ref.current.value = null;
            toast.success("Cập nhật ảnh đại diện thành công");
        } catch (error) {
            toast.error("Có lỗi xảy ra khi cập nhật ảnh đại diện");
        }
    }

    const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }

    const createImage = async (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = "anonymous";
            image.onload = () => resolve(image);
            image.onerror = (error) => reject(error);
            image.src = url;
        })
    }

    const getCroppedImg = async (imgSrc: string, pixelCrop: { x: number, y: number, width: number, height: number }) => {
        const img = await createImage(imgSrc);
        const canvas = document.createElement('canvas');
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(
            img,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        )
        return canvas.toDataURL('image/jpeg');
    }
    const onUserChange = useEffectEvent((imgUrl: string | null) => {
        setAvatarUrl(imgUrl);
    });

    useEffect(() => {
        onUserChange(user?.imgUrl || null);
    }, [user]);
    return (
        <div>
            <Card className={`${className}`}>
                <CardContent className='flex justify-between gap-4 items-center'>
                    <div className='flex gap-2 items-center mt-5'>
                        <Avatar className="w-32 h-32">
                            <AvatarImage src={avatarUrl || ''} alt="User Avatar" />
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
                    <div className="relative w-full h-80">
                        <Cropper
                            image={imageSrc as string}
                            crop={crop}
                            zoom={zoom}
                            aspect={1 / 1}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />
                    </div>
                    <Slider
                        className='cursor-pointer mt-4 transition-all'
                        min={1}
                        max={5}
                        step={0.1}
                        value={[zoom]}
                        onValueChange={(e) => setZoom(e[0])}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setOpen(false); setImageSrc(null); ref.current.value = null; }}>Hủy</Button>
                        <Button onClick={saveAvatar}>Lưu</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}
