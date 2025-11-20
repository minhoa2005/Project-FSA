import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, ThumbsUp, Reply } from "lucide-react";

export function BlogDetailScreen() {
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
        }
      ]
    },
    {
      id: 2,
      author: "Lê Văn C",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
      content: "Mình đã áp dụng tip số 3 và thấy rất hiệu quả. Bạn có thể viết thêm về chủ đề này không?",
      likes: 8,
      time: "5 giờ trước",
      replies: []
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Blog Header */}
        <div className="mb-6">
          <Badge className="mb-4">Công nghệ</Badge>
          <h1 className="mb-4">10 Tips for Better Web Development</h1>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" />
                <AvatarFallback>NV</AvatarFallback>
              </Avatar>
              <div>
                <p>Nguyễn Văn A</p>
                <p className="text-sm text-gray-600">15/11/2024 • 5 phút đọc</p>
              </div>
            </div>
            
            <Button variant="outline" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Cover Image */}
        
        {/* Engagement Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  <span>245</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>32</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Share2 className="w-5 h-5" />
                  <span>18</span>
                </Button>
              </div>
              
              <Button variant="ghost" size="sm">
                <Bookmark className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Blog Content */}
        <Card className="mb-6">
          <CardContent className="p-8 prose max-w-none">
            <p>
              Web development is constantly evolving, and staying up-to-date with the latest best practices is crucial for creating efficient, maintainable code. In this article, I'll share my top 10 tips that have helped me become a better developer.
            </p>
            
            <h2>1. Write Clean, Readable Code</h2>
            <p>
              Clean code is not just about making your code work—it's about making it understandable for others (and your future self). Use meaningful variable names, proper indentation, and comments where necessary.
            </p>
            
            <h2>2. Master the Fundamentals</h2>
            <p>
              Before jumping into the latest framework, make sure you have a solid understanding of HTML, CSS, and JavaScript. These fundamentals will serve you well regardless of which tools you use.
            </p>
            
            <h2>3. Learn Version Control</h2>
            <p>
              Git is an essential tool for any developer. Understanding version control will help you collaborate with others and manage your codebase effectively.
            </p>
            
            <p className="text-gray-600 italic">
              Continue reading to discover the remaining 7 tips that will transform your web development workflow...
            </p>
          </CardContent>
        </Card>
        
        {/* Tags */}
        <div className="flex gap-2 mb-6">
          <Badge variant="secondary">webdev</Badge>
          <Badge variant="secondary">programming</Badge>
          <Badge variant="secondary">tips</Badge>
          <Badge variant="secondary">javascript</Badge>
        </div>
        
        <Separator className="my-8" />
        
        {/* Comments Section */}
        <div>
          <h2 className="mb-4">Bình luận ({comments.length})</h2>
          
          {/* Add Comment */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Avatar>
                  <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea 
                    placeholder="Viết bình luận của bạn..."
                    rows={3}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button variant="outline" size="sm">Hủy</Button>
                    <Button size="sm">Bình luận</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarImage src={comment.avatar} />
                      <AvatarFallback>{comment.author[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{comment.author}</span>
                        <span className="text-sm text-gray-500">• {comment.time}</span>
                      </div>
                      <p className="text-gray-700 mb-2">{comment.content}</p>
                      <div className="flex gap-3">
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {comment.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <Reply className="w-4 h-4 mr-1" />
                          Trả lời
                        </Button>
                      </div>
                      
                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 pl-6 border-l-2 border-gray-200 space-y-4">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={reply.avatar} />
                                <AvatarFallback>{reply.author[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm">{reply.author}</span>
                                  <span className="text-xs text-gray-500">• {reply.time}</span>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">{reply.content}</p>
                                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                                  <ThumbsUp className="w-3 h-3 mr-1" />
                                  {reply.likes}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
