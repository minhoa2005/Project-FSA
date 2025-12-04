import { userInfo } from '@/types/user/personalInfor'
import BlogSection from './BlogSec/BlogSection'
import CoverSection from './CoverSec/CoverSection'
import FollowButton from './CoverSec/FollowButton'
import InfoCard from './InfoSec/InfoCard'
import { verifyToken } from '@/config/jwt'
import { getCookie } from '@/config/cookie'

export default async function PersonalPage({ data, id }: {
    data: userInfo,
    id: number
}) {
    const watcherId = Number(verifyToken(await getCookie()).id);
    return (
        <div className='flex flex-col'>
            <CoverSection user={data} />
            <div className='flex flex-row p-3 items-start'>
                <InfoCard user={data} id={id} watcherId={watcherId} />
                <BlogSection id={id} watcherId={watcherId} className='flex-1' />
            </div>
        </div>
    )
}
