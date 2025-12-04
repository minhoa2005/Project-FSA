"use client"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { useUser } from '@/context/AuthContext'
import { updateAvatar, updateCoverImage } from '@/service/users/personalInfo'
import NextImage from 'next/image'
import React, { useRef, useState } from 'react'
import Cropper from 'react-easy-crop'
import { toast } from 'sonner'

export default function CoverImageSection({ className }: { className?: string }) {

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

    const saveCoverImage = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        try {
            const croppedDataUrl = await getCroppedImg(imageSrc as string, croppedAreaPixels);
            setAvatarUrl(croppedDataUrl);
            setOpen(false);
            setImageSrc(null);
            const result = await updateCoverImage(croppedDataUrl);
            setUser((prev) => ({ ...prev, coverImg: result.url }));
            ref.current.value = null;
            toast.success("Cập nhật ảnh nền thành công");
        } catch (error) {
            toast.error("Có lỗi xảy ra khi cập nhật ảnh nền");
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
    return (
        <Card className={`${className}`}>
            <CardContent className='flex items-center justify-between h-full gap-4'>
                <div className='flex gap-2 items-center h-full'>
                    {user?.coverImg ?
                        (<NextImage src={user?.coverImg || ''}
                            alt='coverImage' width={180} height={80} className='rounded' objectFit='cover' />)
                        : <></>}

                    <div className='flex flex-col gap-1' >
                        <p>Ảnh nền</p>
                        <p className='text-zinc-400 text-sm' >PNG, JPEG dưới 15MB</p>
                    </div>
                </div>
                <div className='flex flex-col gap-2 justify-center' >
                    <Button className={'cursor-pointer'} onClick={() => ref.current.click()}>Đăng tải ảnh</Button>
                    <Button variant="outline" className={'cursor-pointer'}>Xóa</Button>
                    <Input type='file' className='hidden' accept="image/*" ref={ref} onChange={onFileChange} />
                </div>
            </CardContent>
            <Dialog open={open} onOpenChange={(state) => {
                setOpen(state);
                if (!state) {
                    setImageSrc(null);
                    ref.current.value = null;
                }
            }} >
                <DialogContent className="max-w-[50%]">
                    <DialogHeader>
                        <DialogTitle>Chọn ảnh đại diện</DialogTitle>
                        <DialogDescription>Chỉnh sửa ảnh</DialogDescription>
                    </DialogHeader>
                    <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px]">
                        <Cropper
                            image={imageSrc as string}
                            crop={crop}
                            zoom={zoom}
                            aspect={2.7 / 1}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />
                    </div>
                    <Slider
                        className='cursor-pointer mt-4 transition-all'
                        min={1}
                        max={5}
                        step={0.01}
                        value={[zoom]}
                        onValueChange={(e) => setZoom(e[0])}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setOpen(false); setImageSrc(null); ref.current.value = null; }}>Hủy</Button>
                        <Button onClick={saveCoverImage}>Lưu</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    )
}
