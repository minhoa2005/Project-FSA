import React from 'react'
import AvatarSection from './AvatarSection'
import InfoSection from './InfoSection'
import PasswordSection from './PasswordSection'
import CoverImageSection from './CoverImageSection'

export default function PersonalInfo() {
  return (
    <div className='flex flex-col items-center ' >
      <div className='w-[70%] flex gap-5 flex-col' >
        <div className='grid grid-cols-2 gap-3'>
          <AvatarSection className={'mt-4'} />
          <CoverImageSection className='mt-4 ' />
        </div>
        <div className='grid grid-cols-2 gap-3 items-start' >
          <InfoSection />
          <PasswordSection />
        </div>
      </div>
    </div>
  )
}
