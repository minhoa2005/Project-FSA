import UserAvatar from '@/components/layout/UserAvatar';
import { CommentSection } from '@/components/post/CommentSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Post } from '@/types/user/postT';
import { Flag, MessageCircle, MoreHorizontal, Share2, ThumbsUp } from 'lucide-react';
import Image from 'next/image';
import ReportModal from './ReportModal';

export default function PostCard({ post }: { post: Post }) {
    console.log(post);
    const images = post?.media.filter((m: any) => m.mediaType === 'image') || [];
    const videos = post?.media.filter((m: any) => m.mediaType === 'video') || [];
    return (
        <Card className="overflow-hidden shadow-sm ">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                    <UserAvatar className="h-10 w-10" />
                    <div className="leading-tight">
                        <div className="text-sm font-semibold">{post?.username}</div>
                        <div className="text-xs text-muted-foreground">{new Date(post?.createdAt).toLocaleDateString('vn-VN')}</div>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 text-sm">
                        <DropdownMenuItem>Chỉnh sửa bài viết</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Xóa bài viết</DropdownMenuItem>
                        <ReportModal blogId={post.id} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>

            <CardContent className="space-y-3 pb-2">
                <>
                    {post.text && <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.text}</p>}
                    {images.length > 0 && (
                        <div className={`grid gap-1 overflow-hidden rounded-lg ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                            {images.map((m: any) => (
                                <Image key={m.id} src={m.url} alt="" width={1200} height={800} className="aspect-[16/9] w-full object-cover" />
                            ))}
                        </div>
                    )}
                    {videos.length > 0 && (
                        <div className="space-y-2">
                            {videos.map((m: any) => (
                                <video key={m.id} src={m.url} controls className="max-h-[400px] w-full rounded-lg" />
                            ))}
                        </div>
                    )}
                </>

            </CardContent>

            <CardFooter className="flex flex-col gap-4 border-t px-2 pb-2 pt-1">
                <div className="flex items-center justify-between px-1 text-xs text-muted-foreground gap-5">
                    <span>{post?.likeCount} lượt thích</span>
                    <span>0 bình luận</span>
                </div>
                <div className="mt-1 grid grid-cols-3 gap-4 text-xs">
                    <Button variant="ghost" size="sm" className={`flex items-center justify-center gap-1 rounded-md py-1 text-muted-foreground ${post?.isLikedByCurrentUser ? "text-blue-500 hover:bg-blue-100 hover:text-blue-500" : ""}`}>
                        <ThumbsUp className="h-4 w-4" /> Thích
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center justify-center gap-1 text-muted-foreground">
                        <MessageCircle className="h-4 w-4" /> Bình luận
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center justify-center gap-1 text-muted-foreground">
                        <Share2 className="h-4 w-4" /> Chia sẻ
                    </Button>
                </div>
            </CardFooter>
        </Card >
    );
}
