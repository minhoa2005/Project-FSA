import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getPersonalInfoById } from '@/service/users/personalInfo';
import { userInfo } from '@/types/user/personalInfor';
import React from 'react'

export default async function InfoCard({ user }: { user: userInfo }) {
    return (
        <Card className="w-[30%]">
            <CardHeader>
                <CardTitle className='text-2xl'>Giới thiệu</CardTitle>
            </CardHeader>
            <CardContent>

            </CardContent>
        </Card>
    )
}
