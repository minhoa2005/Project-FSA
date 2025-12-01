import PersonalPage from '@/components/user/personalPage/PersonalPage'
import { getPersonalInfoById } from '@/service/users/personalInfo';
import React from 'react'

export default async function page({ params }: { params: { id: string } }) {
    const { id } = await params;
    const data = await getPersonalInfoById(parseInt(id));
    return (
        <div>
            <PersonalPage data={data.data} id={parseInt(id)} />
        </div>
    )
}
