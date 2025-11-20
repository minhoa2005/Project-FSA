
import ContactsSidebar from '@/components/blog/ContactsSidebar'
import { PostCard } from '@/components/blog/PostCard'

import React from 'react'

export default function page() {
    return (
        <div className='grid grid-cols-4'>
            <div className='col-span-3'>
                <PostCard/>
                {/* Content */}
            </div>
            <div  className='cols-span-1'>
                <ContactsSidebar />
            </div>
        </div>
    )
}
 