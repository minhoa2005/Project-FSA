import React, { Suspense } from 'react'
import AvatarSection from './AvatarSection'
import InfoSection from './InfoSection'
import PasswordSection from './PasswordSection'
import CoverImageSection from './CoverImageSection'
import { getPersonalInfo } from '@/service/users/personalInfo'
import InfoSectionSkeleton from './InfoSectionSkeleton'

export default function PersonalInfo() {
  const getData = getPersonalInfo();
  return (
    <div className='flex flex-col items-center ' >
      <div className='w-[70%] flex gap-5 flex-col' >
        <div className='grid grid-cols-2 gap-3'>
          <AvatarSection className={'mt-4'} />
          <CoverImageSection className='mt-4 ' />
        </div>
        <div className='grid grid-cols-2 gap-3 items-start' >
          <Suspense fallback={<InfoSectionSkeleton />}>
            <InfoSection fetchInfo={getData} />
          </Suspense>
          <PasswordSection />
        </div>
      </div>
    </div>
  )
}
