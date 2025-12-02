
import BlogSection from './BlogSec/BlogSection'
import CoverSection from './CoverSec/CoverSection'
import FollowButton from './CoverSec/FollowButton'

export default function PersonalPage({ data, id }: {
    data: {
        email: string,
        fullName: string,
        phoneNumber: string,
        dob: string,
        imgUrl: string
    },
    id: number
}) {
    return (
        <div className='flex flex-col'>
            <CoverSection user={data} />
            <BlogSection id={id} />
        </div>
    )
}
