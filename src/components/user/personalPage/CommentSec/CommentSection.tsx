import { Send } from "lucide-react";
import { CommentItem, CommentData } from "./CommentItem";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CommentSectionProps {
    comments: CommentData[];
}

export function CommentSection({ comments }: CommentSectionProps) {
    return (
        <div className="px-4 py-3 w-full border-t">
            <div className="mb-3 space-y-4">
                {comments.map((comment) => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        level={0}
                    />
                ))}
            </div>

            <form className="flex gap-2">
                <div className="flex-1 relative">
                    <Input
                        type="text"
                        placeholder="Viết bình luận..."
                        className="w-full px-4 py-3 pr-10 text-sm rounded-full"
                    />
                    <Button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-full"
                        variant="ghost"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
}