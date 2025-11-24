// src/app/(private)/(user)/page.jsx
import { getAllBlogs } from '@/service/users/post'
import CreatePostTrigger from '@/components/post/CreatePostTrigger'
import PostCard from '@/components/post/PostCard'
import ContactsSidebar from '@/components/blog/ContactsSidebar'

export default async function FeedPage() {
  const posts = await getAllBlogs()

  return (
    <div className='grid grid-cols-4'>
            <div className='col-span-3'>
                <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto pt-20 px-4 space-y-6">
        <CreatePostTrigger />
        {posts.length === 0 ? (
          <p className="text-center py-20 text-gray-500 text-xl">Chưa có bài viết nào</p>
        ) : (
          posts.map(post => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
            </div>
            <div  className='cols-span-1'>
                <ContactsSidebar />
            </div>
        </div>
    
    
  )
}