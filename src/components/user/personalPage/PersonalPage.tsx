
import { userInfo } from '@/types/user/personalInfor'
import BlogSection from './BlogSec/BlogSection'
import CoverSection from './CoverSec/CoverSection'
import FollowButton from './CoverSec/FollowButton'
import InfoCard from './InfoSec/InfoCard'

export default function PersonalPage({ data, id }: {
    data: userInfo,
    id: number
}) {
    console.log("PersonalPage data:", data);
    return (
        <div className='flex flex-col'>
            <CoverSection user={data} />
            <div className='flex flex-row p-3 items-start'>
                <InfoCard user={data} />
                <BlogSection id={id} className='flex-1' />
            </div>
        </div>
    )
}
