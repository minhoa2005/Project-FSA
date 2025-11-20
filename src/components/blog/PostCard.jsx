'use client';
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  ThumbsUp,
  Reply,
  Send,
} from "lucide-react";
import { useState } from "react";

export function PostCard() {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(245);

  const comments = [
    {
      id: 1,
      author: "Trần Thị B",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
      content: "Bài viết rất hữu ích! Cảm ơn bạn đã chia sẻ.",
      likes: 12,
      time: "2 giờ trước",
      replies: [
        {
          id: 11,
          author: "Nguyễn Văn A",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
          content: "Cảm ơn bạn đã đọc!",
          likes: 3,
          time: "1 giờ trước",
        },
      ],
    },
    {
      id: 2,
      author: "Lê Văn C",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
      content: "Mình đã áp dụng tip số 3 và thấy rất hiệu quả. Bạn có thể viết thêm về chủ đề này không?",
      likes: 8,
      time: "5 giờ trước",
      replies: [],
    },
  ];

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardContent className="p-0">
            {/* Header */}
            <div className="p-6 pb-4">
              <Badge className="mb-4">Công nghệ</Badge>
              <h1 className="text-3xl font-bold mb-4 leading-tight">
                10 Tips for Better Web Development
              </h1>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 border-2 border-white shadow">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" />
                    <AvatarFallback>NV</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">Nguyễn Văn A</p>
                    <p className="text-sm text-gray-600">15/11/2024 • 5 phút đọc</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Nội dung bài viết */}
            <div className="px-6 pb-6 prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed text-gray-800">
                Web development is constantly evolving, and staying up-to-date with the latest best practices is crucial for creating efficient, maintainable code...
              </p>
              {/* ... nội dung đầy đủ của bạn ... */}
            </div>

            {/* Tags */}
            <div className="px-6 py-3 flex flex-wrap gap-2">
              <Badge variant="secondary">webdev</Badge>
              <Badge variant="secondary">programming</Badge>
              <Badge variant="secondary">tips</Badge>
              <Badge variant="secondary">javascript</Badge>
            </div>

            <Separator />

            {/* THANH TƯƠNG TÁC CHÍNH - ĐẸP NHƯ FACEBOOK */}
            <div className="border-t bg-white">
              <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Heart className="w-5 h-5 fill-blue-500 text-blue-500" />
                    <span className="font-medium">{likeCount}</span>
                  </div>
                  <span>{comments.length} bình luận</span>
                  <span>18 lượt chia sẻ</span>
                </div>
              </div>

              <div className="grid grid-cols-3 border-t">
                <Button
                  variant="ghost"
                  className="h-12 rounded-none hover:bg-gray-100 flex-1 gap-2 font-medium"
                  onClick={handleLike}
                >
                  <Heart
                    className={`w-5 h-5 ${liked ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                  />
                  <span className={liked ? "text-red-500" : ""}>
                    {liked ? "Đã thích" : "Thích"}
                  </span>
                </Button>

                <Button
                  variant="ghost"
                  className="h-12 rounded-none hover:bg-gray-100 flex-1 gap-2 font-medium"
                >
                  <MessageCircle className="w-5 h-5 text-gray-600" />
                  Bình luận
                </Button>

                <Button
                  variant="ghost"
                  className="h-12 rounded-none hover:bg-gray-100 flex-1 gap-2 font-medium"
                >
                  <Share2 className="w-5 h-5 text-gray-600" />
                  Chia sẻ
                </Button>
              </div>
            </div>

            <Separator />

            {/* Phần bình luận */}
            <div className="p-6 bg-gray-50">
              <h2 className="text-xl font-semibold mb-6">
                Bình luận ({comments.length})
              </h2>

              {/* Ô viết bình luận */}
              <div className="flex gap-4 mb-8">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1 relative">
                  <Textarea
                    placeholder="Viết bình luận của bạn..."
                    className="min-h-20 resize-none pr-12"
                  />
                  <Button
                    size="icon"
                    className="absolute bottom-2 right-2 rounded-full"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Danh sách bình luận - kiểu bong bóng đẹp */}
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage src={comment.avatar} />
                      <AvatarFallback>{comment.author[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-200 rounded-2xl px-4 py-3 inline-block max-w-lg">
                        <p className="font-semibold text-sm">{comment.author}</p>
                        <p className="text-gray-800">{comment.content}</p>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm">
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          Thích ({comment.likes})
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <Reply className="w-4 h-4 mr-1" />
                          Trả lời
                        </Button>
                        <span className="text-gray-500">{comment.time}</span>
                      </div>

                      {/* Replies */}
                      {comment.replies.length > 0 && (
                        <div className="mt-4 ml-14 space-y-4">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={reply.avatar} />
                                <AvatarFallback>{reply.author[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="bg-gray-200 rounded-2xl px-4 py-3">
                                  <p className="font-semibold text-sm">{reply.author}</p>
                                  <p className="text-sm">{reply.content}</p>
                                </div>
                                <div className="flex gap-4 mt-1 text-xs">
                                  <Button variant="ghost" size="sm" className="h-7">
                                    Thích ({reply.likes})
                                  </Button>
                                  <span className="text-gray-500">{reply.time}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}