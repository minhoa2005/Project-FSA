"use client";

import { useState, FormEvent } from "react";
import { X, Share2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { shareBlog } from "@/service/users/shareActions";
import { toast } from "sonner";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface OriginalPost {
  id: number;
  text?: string;
  creatorId: number;
  fullName?: string;
  username?: string;
  imgUrl?: string;
  media?: Array<{ id: number; url: string; type: string }>;
}

interface SharePostDialogProps {
  originalPost: OriginalPost;
  currentUser: {
    id: number;
    name: string;
    avatar?: string;
  };
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SharePostDialog({
  originalPost,
  currentUser,
  onClose,
  onSuccess,
}: SharePostDialogProps) {
  const [shareText, setShareText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("originalBlogId", String(originalPost.id));
      formData.append("userId", String(currentUser.id));
      formData.append("text", shareText);

      const result = await shareBlog(formData);

      if (result.success) {
        toast.success("Đã chia sẻ bài viết!");
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.message || "Chia sẻ thất bại");
      }
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const originalAuthorName = originalPost.fullName || originalPost.username || `User #${originalPost.creatorId}`;
  const originalAvatar = originalPost.imgUrl || "";
  const originalAvatarFallback = originalAuthorName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "U";

  const currentUserFallback = currentUser.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-background/70 z-50"
        onClick={!submitting ? onClose : undefined}
      />

      {/* Dialog */}
      <Card className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-2xl z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardContent>
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Chia sẻ bài viết</h2>
            <Button
              onClick={onClose}
              disabled={submitting}
              className="w-9 h-9 rounded-full  flex items-center justify-center disabled:opacity-50"
              variant="ghost"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Current User Info */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {currentUser.avatar ? (
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  ) : null}
                  <AvatarFallback>{currentUserFallback}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{currentUser.name}</p>
                </div>
              </div>

              {/* Share Text Input */}
              <Textarea
                value={shareText}
                onChange={(e) => setShareText(e.target.value)}
                placeholder={`${currentUser.name} ơi, bạn nghĩ gì về bài viết này?`}
                className="min-h-[100px] resize-none text-sm border-0 focus-visible:ring-0 p-0"
                disabled={submitting}
              />
            </div>

            {/* Original Post Preview */}
            <div className="mx-4 mb-4 border rounded-lg overflow-hidden ">
              {/* Original Author */}
              <div className="p-3 flex items-center gap-2 border-b">
                <Avatar className="h-8 w-8">
                  {originalAvatar ? (
                    <AvatarImage src={originalAvatar} alt={originalAuthorName} />
                  ) : null}
                  <AvatarFallback className="text-xs">{originalAvatarFallback}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold">{originalAuthorName}</span>
              </div>

              {/* Original Content */}
              <div className="p-3 space-y-2">
                {originalPost.text && (
                  <p className="text-sm whitespace-pre-wrap line-clamp-6">
                    {originalPost.text}
                  </p>
                )}

                {/* Original Media Preview */}
                {originalPost.media && originalPost.media.length > 0 && (
                  <div className="grid grid-cols-2 gap-1 mt-2">
                    {originalPost.media.slice(0, 4).map((media) => (
                      <div key={media.id} className="relative aspect-video rounded overflow-hidden">
                        {media.type === "image" ? (
                          <Image
                            src={media.url}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        ) : media.type === "video" ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-8 h-8   " />
                            <span className="absolute bottom-1 right-1 text-xs px-1 rounded">Video</span>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}

                {originalPost.media && originalPost.media.length > 4 && (
                  <p className="text-xs ">+{originalPost.media.length - 4} ảnh/video khác</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0  border-t p-4">
              <Button
                type="submit"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? "Đang chia sẻ..." : "Chia sẻ ngay"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}