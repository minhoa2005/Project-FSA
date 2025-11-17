import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Send } from "lucide-react";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";

export function NewsfeedScreen() {
    const posts = [
        {
            id: 1,
            author: "Nguyễn Văn A",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
            time: "2 giờ trước",
            content: "Just finished an amazing web development project! 🚀 Check out what I've learned about React and TypeScript.",
            image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
            likes: 245,
            comments: 32,
            shares: 18,
            isLiked: true,
            isSaved: false
        },
        {
            id: 2,
            author: "Trần Thị B",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
            time: "5 giờ trước",
            content: "React Hooks have revolutionized the way we write React components. Here's what you need to know! 💡",
            image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
            likes: 189,
            comments: 24,
            shares: 12,
            isLiked: false,
            isSaved: true
        },
        {
            id: 3,
            author: "Lê Văn C",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
            time: "1 ngày trước",
            content: "Healthy eating doesn't have to be complicated. Start with these simple tips! 🥗",
            image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800",
            likes: 312,
            comments: 45,
            shares: 28,
            isLiked: false,
            isSaved: false
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            <div className="flex">
                {/* Main Feed */}
                <div className="flex-1 max-w-[680px] mx-auto p-6">
                    {/* Create Post */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex gap-3">
                                <Avatar>
                                    <AvatarFallback>M</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <Input
                                        placeholder="What's on your mind?"
                                        className="bg-secondary/50 border-0 mb-3"
                                    />
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                                                📷 Photo
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                                                😊 Feeling
                                            </Button>
                                        </div>
                                        <Button size="sm">Post</Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Posts */}
                    {posts.map((post) => (
                        <Card key={post.id} className="mb-6">
                            <CardContent className="p-0">
                                {/* Post Header */}
                                <div className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={post.avatar} />
                                            <AvatarFallback>{post.author[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p>{post.author}</p>
                                            <p className="text-sm text-muted-foreground">{post.time}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-5 w-5" />
                                    </Button>
                                </div>

                                {/* Post Content */}
                                <div className="px-4 pb-3">
                                    <p className="text-foreground">{post.content}</p>
                                </div>

                                {/* Post Image */}

                                {/* Engagement Stats */}
                                <div className="flex items-center justify-between px-4 py-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <div className="flex -space-x-1">
                                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                                                👍
                                            </div>
                                            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                                                ❤️
                                            </div>
                                        </div>
                                        <span>{post.likes}</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <span>{post.comments} comments</span>
                                        <span>{post.shares} shares</span>
                                    </div>
                                </div>

                                <Separator />

                                {/* Action Buttons */}
                                <div className="flex items-center justify-around p-2">
                                    <Button
                                        variant="ghost"
                                        className={`flex-1 ${post.isLiked ? 'text-blue-600' : 'text-muted-foreground'}`}
                                    >
                                        <Heart className={`h-5 w-5 mr-2 ${post.isLiked ? 'fill-blue-600' : ''}`} />
                                        Like
                                    </Button>
                                    <Button variant="ghost" className="flex-1 text-muted-foreground">
                                        <MessageCircle className="h-5 w-5 mr-2" />
                                        Comment
                                    </Button>
                                    <Button variant="ghost" className="flex-1 text-muted-foreground">
                                        <Share2 className="h-5 w-5 mr-2" />
                                        Share
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={post.isSaved ? 'text-blue-600' : 'text-muted-foreground'}
                                    >
                                        <Bookmark className={`h-5 w-5 ${post.isSaved ? 'fill-blue-600' : ''}`} />
                                    </Button>
                                </div>

                                <Separator />

                                {/* Comments Section */}
                                <div className="p-4">
                                    {/* Sample comments */}
                                    <div className="space-y-3 mb-3">
                                        <div className="flex gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" />
                                                <AvatarFallback>P</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="bg-secondary rounded-2xl px-4 py-2">
                                                    <p className="text-sm">Phạm Thị D</p>
                                                    <p className="text-sm text-muted-foreground">Great post! Thanks for sharing 👍</p>
                                                </div>
                                                <div className="flex gap-3 px-4 mt-1">
                                                    <button className="text-xs text-muted-foreground hover:underline">Like</button>
                                                    <button className="text-xs text-muted-foreground hover:underline">Reply</button>
                                                    <span className="text-xs text-muted-foreground">1h</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Add Comment */}
                                    <div className="flex gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>M</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 flex gap-2">
                                            <Input
                                                placeholder="Write a comment..."
                                                className="bg-secondary/50 border-0 rounded-full"
                                            />
                                            <Button size="icon" variant="ghost">
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
