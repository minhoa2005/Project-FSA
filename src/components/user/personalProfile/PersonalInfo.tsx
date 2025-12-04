import React, { Suspense } from 'react'
import AvatarSection from './AvatarSection'
import InfoSection from './InfoSection'
import PasswordSection from './PasswordSection'
import CoverImageSection from './CoverImageSection'
import { getPersonalInfo } from '@/service/users/personalInfo'
import InfoSectionSkeleton from './InfoSectionSkeleton'
import BioSection from './BioSection'

export default async function PersonalInfo() {
  const getData = getPersonalInfo();
  return (
    <div className='flex flex-col items-center ' >
      <div className='w-[70%] flex gap-5 flex-col' >
        <div className='grid grid-cols-2 gap-3'>
          <AvatarSection className={'mt-4  cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ease-in-out'} />
          <CoverImageSection className='mt-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ease-in-out' />
        </div>
        <div className='grid grid-cols-2 gap-3' >
          <Suspense fallback={<InfoSectionSkeleton />}>
            <InfoSection className='cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ease-in-out' />
          </Suspense>
          <PasswordSection className='cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ease-in-out' />
        </div>
        <div className='cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ease-in-out'>
          <BioSection />
        </div>
      </div>
    </div>
  )
}
