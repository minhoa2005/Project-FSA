import BlogSection from './BlogSection'
import CoverSection from './CoverSection'
import FollowButton from './FollowButton'

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
