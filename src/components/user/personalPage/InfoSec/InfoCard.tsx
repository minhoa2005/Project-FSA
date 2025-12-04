"use client"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { updateBio } from '@/service/users/personalInfo';
import { userInfo } from '@/types/user/personalInfor';
import Link from 'next/link';
import React, { useState } from 'react'
import { toast } from 'sonner';

export default function InfoCard({ user, id, watcherId }: { user: userInfo, id: number, watcherId: number }) {
    const [isEditingBio, setEditingBio] = useState(false);
    const [bio, setBio] = useState(user.bio || '');
    const [countWords, setCountWords] = useState(100);
    const saveBio = async () => {
        try {
            if (watcherId !== id) {
                toast.error("Bạn không có quyền chỉnh sửa");
                return;
            }
            const data = {
                bio: bio,
                homeTown: user.homeTown,
                location: user.location,
                education: user.education,
                workAt: user.workAt
            }
            const response = await updateBio(data);
            if (response.success) {
                toast.success("Cập nhật thành công");
            }
            else {
                toast.error("Cập nhật thất bại");
            }
        }
        catch (error) {
            toast.error("Cập nhật thất bại");
        }
    }
    return (
        <Card className="w-[30%]">
            <CardHeader>
                <CardTitle className='text-2xl'>Giới thiệu</CardTitle>
            </CardHeader>
            <CardContent>
                {/* {watcherId === user.id && (

                )} */}
                <div>
                    <div>
                        {isEditingBio ? (
                            <>
                                <Textarea
                                    className='w-full h-24 border p-2 mb-2 placeholder:text-center min-h-[100px] placeholder:text-xl resize-none'
                                    placeholder='Hãy giới thiệu về bản thân'
                                    value={bio}
                                    onChange={(e) => {
                                        if (e.target.value.length > 100) return;
                                        setBio(e.target.value);
                                        setCountWords(100 - e.target.value.length);
                                    }}
                                />
                                <p className='text-right text-sm text-muted-foreground'>{countWords} ký tự còn lại</p>
                            </>
                        ) : (
                            <p className='text-center'>{user.bio}</p>
                        )}
                        {watcherId === id && (
                            <div className='flex justify-center mt-2'>
                                <Button className='w-full' onClick={() => {
                                    if (isEditingBio) {
                                        saveBio();
                                        setEditingBio(false);
                                    } else {
                                        setEditingBio(true);
                                    }
                                }}
                                >{!user.bio ? isEditingBio ? `Lưu` : "Thêm giới thiệu" : "Cập nhập giới thiệu"}</Button>
                            </div>
                        )}
                        <Separator className="my-4" />
                        {watcherId === id && (
                            <Link href={`/personal/info`} className='flex justify-center mt-3'>
                                <Button className='w-full'
                                >
                                    Chỉnh sửa thông tin cá nhân
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

            </CardContent>
        </Card >
    )
}
