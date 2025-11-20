// src/components/post/PostCard.jsx
export default function PostCard({ post }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
      <div className="p-4 flex gap-3">
        <img src={post.author.image} className="w-10 h-10 rounded-full" alt="" />
        <div>
          <h3 className="font-semibold">{post.author.name}</h3>
          <p className="text-sm text-gray-500">Vừa xong</p>
        </div>
      </div>

      {post.content && <p className="px-4 text-lg">{post.content}</p>}

      {post.media.length > 0 && (
        <div className={`grid gap-1 ${post.media.length === 1 ? '' : 'grid-cols-2'}`}>
          {post.media.map((m, i) => (
            m.type === 'image' ? 
              <img key={i} src={m.url} className="w-full object-cover max-h-96" /> :
              <video key={i} src={m.url} controls className="w-full" />
          ))}
        </div>
      )}

      <div className="p-4 border-t flex justify-around text-gray-600">
        <button className="hover:bg-gray-100 px-6 py-2 rounded">👍 Thích</button>
        <button className="hover:bg-gray-100 px-6 py-2 rounded">💬 Bình luận</button>
        <button className="hover:bg-gray-100 px-6 py-2 rounded">↗️ Chia sẻ</button>
      </div>
    </div>
  )
}