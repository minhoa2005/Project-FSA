import React from 'react'
import AvatarSection from './AvatarSection'
import InfoSection from './InfoSection'
import PasswordSection from './PasswordSection'

export default function PersonalInfo() {
  return (
    <div className='flex flex-col justify-center items-center' >
      <div className='w-[70%] flex gap-5 flex-col' >
        <AvatarSection className={'mt-4'} />
        <div className='flex flex-row gap-3' >
          <InfoSection className={'flex-1'} />
          <PasswordSection className={'flex-1'} />
        </div>
      </div>
    </div>
  )
}
