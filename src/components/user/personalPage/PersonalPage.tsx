import BlogSection from './BlogSection'
import CoverSection from './CoverSection'

export default function PersonalPage({ data }: {
    data: {
        email: string,
        fullName: string,
        phoneNumber: string,
        dob: string,
        imgUrl: string
    }
}) {
    return (
        <div>
            <CoverSection user={data} />
            <BlogSection />
        </div>
    )
}
