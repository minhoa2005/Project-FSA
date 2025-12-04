"use client"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { getPersonalInfo, updateBio } from '@/service/users/personalInfo'
import { Home, MapPin, Briefcase, GraduationCap, Quote, X } from 'lucide-react'
import React, { use, useEffect, useEffectEvent, useState } from 'react'
import { toast } from 'sonner'

export default function BioSection() {
    const [homeTown, setHomeTown] = useState('');
    const [location, setLocation] = useState('');
    const [education, setEducation] = useState('');
    const [workAt, setWorkAt] = useState('');
    const [bio, setBio] = useState('');
    const [provinceData, setProvinceData] = useState<string[]>([]);
    const fetchData = useEffectEvent(async () => {
        try {
            const response = await getPersonalInfo();
            if (response.success) {
                setBio(response.data.bio || '');
                setHomeTown(response.data.homeTown || '');
                setLocation(response.data.location || '');
                setWorkAt(response.data.workAt || '');
                setEducation(response.data.education || '');
            }
        }
        catch (error) {
            console.error("Error fetching personal info:", error);
        }
    })
    const fetchProvinceData = useEffectEvent(async () => {
        try {
            const response = await fetch('https://provinces.open-api.vn/api/v2/p/', {
                method: 'GET'
            }).then(res => res.json());
            setProvinceData(response.map((province: any) => province.name));
        }
        catch (error) {
            console.log("Error fetching province data:", error);
        }
    })
    const handleUpdateBio = async () => {
        try {
            console.log(education);
            const data = {
                bio: bio,
                homeTown: homeTown === "none" ? '' : homeTown,
                location: location === "none" ? '' : location,
                workAt: workAt,
                education: education
            }
            const response = await updateBio(data);
            if (response.success) {
                toast.success("Cập nhật thành công");
            }
            else {
                toast.error(response.message || "Cập nhật thất bại");
            }
        }
        catch (error) {
            toast.error("Cập nhật thất bại");
        }
    }
    useEffect(() => {
        fetchProvinceData();
        fetchData();
    }, [])
    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle className='text-2xl'>Thông tin giới thiệu</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='grid grid-cols-2 gap-3'>
                        <div>
                            <div className='flex flex-col gap-2'>
                                <Label className="text-sm font-medium " htmlFor='bio'>
                                    Giới thiệu
                                </Label>
                                <Textarea
                                    className='w-full h-24 border p-2 mb-2 placeholder:text-center min-h-[100px] placeholder:text-xl resize-none'
                                    id='bio'
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <Label className="text-sm font-medium " htmlFor='hometown'>
                                    Quê quán
                                </Label>
                                <div className='flex flex-row justify-center items-center'>
                                    <Select value={homeTown} onValueChange={setHomeTown}>
                                        <SelectTrigger className="">
                                            <SelectValue placeholder="Chọn quê quán" />
                                        </SelectTrigger>
                                        <SelectContent className='max-h-60 overflow-y-auto'>
                                            {
                                                provinceData.map((province) => (
                                                    <SelectItem key={province} value={province} onClick={() => setHomeTown(province)}>
                                                        {province}
                                                    </SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>
                                    {homeTown && (
                                        <Button variant="ghost" className='text-sm ms-2' onClick={() => setHomeTown('')}>
                                            <X />
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className='flex flex-col gap-2'>
                                <Label className="text-sm font-medium " htmlFor='currentLocation'>
                                    Nơi ở hiện tại
                                </Label>
                                <div className='flex flex-row justify-center items-center'>
                                    <Select value={location} onValueChange={setLocation}>
                                        <SelectTrigger className="">
                                            <SelectValue placeholder="Chọn nơi ở hiện tại" />
                                        </SelectTrigger>
                                        <SelectContent className='max-h-60 overflow-y-auto'>
                                            {
                                                provinceData.map((province) => (
                                                    <SelectItem key={province} value={province} onClick={() => setLocation(province)}>
                                                        {province}
                                                    </SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>
                                    {location && (
                                        <Button variant="ghost" className='text-sm ms-2' onClick={() => setLocation('')}>
                                            <X />
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className='flex flex-col gap-2'>
                                <Label className="text-sm font-medium " htmlFor='job'>
                                    Nghề nghiệp
                                </Label>
                                <Input
                                    className='border p-2 mb-2 placeholder:text-center placeholder:text-xl '
                                    id='job'
                                    value={workAt}
                                    onChange={(e) => setWorkAt(e.target.value)}
                                />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <Label className="text-sm font-medium " htmlFor='education'>
                                    Học vấn
                                </Label>
                                <Input
                                    className='border p-2 mb-2 placeholder:text-center placeholder:text-xl '
                                    id='education'
                                    value={education}
                                    onChange={(e) => setEducation(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className='mt-4'>
                            <p className='text-xl mb-3'>Xem trước</p>
                            <Card>
                                <CardHeader>
                                    <CardTitle className='text-2xl'>Giới thiệu</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className='flex flex-col gap-3'>
                                        {bio && (
                                            <div className='flex items-start gap-3 p-3  rounded-lg'>
                                                <p className='text-center  flex-1'>{bio}</p>
                                            </div>
                                        )}
                                        {homeTown && (
                                            <div className='flex items-center gap-3'>
                                                <Home className='w-5 h-5 text-primary' />
                                                <p>Quê quán: <span className='font-medium'>{homeTown}</span></p>
                                            </div>
                                        )}
                                        {location && (
                                            <div className='flex items-center gap-3'>
                                                <MapPin className='w-5 h-5 text-primary ' />
                                                <p>Hiện đang sống ở <span className='font-medium'>{location}</span></p>
                                            </div>
                                        )}
                                        {workAt && (
                                            <div className='flex items-center gap-3'>
                                                <Briefcase className='w-5 h-5 text-primary' />
                                                <p>Đang làm <span className='font-medium'>{workAt}</span></p>
                                            </div>
                                        )}
                                        {education && (
                                            <div className='flex items-center gap-3'>
                                                <GraduationCap className='w-5 h-5 text-primary' />
                                                <p>Trình độ <span className='font-medium'>{education}</span></p>
                                            </div>
                                        )}
                                        {!bio && !homeTown && !location && !workAt && !education && (
                                            <p className='text-muted-foreground text-center py-4'>Chưa có thông tin giới thiệu</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleUpdateBio}>Lưu thay đổi</Button>
                </CardFooter>
            </Card>
        </div >
    )
}
