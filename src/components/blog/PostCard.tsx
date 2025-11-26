"use client";

import { useState } from "react";
import { updateBlog, deleteBlog } from "@/service/users/postActions";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  ThumbsUp,
  MessageCircle,
  Share2,
  Image as ImageIcon,
  X,
} from "lucide-react";
import Image from "next/image";

interface PostCardProps {
  post: any;
  isOwner: boolean;
  onChanged?: () => void;
}

export default function PostCard({ post, isOwner, onChanged }: PostCardProps) {
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // state dùng cho edit media
  const [removedMediaIds, setRemovedMediaIds] = useState<number[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const createdAt = new Date(post.createdAt).toLocaleString("vi-VN");

  const displayName =
    post.fullName || post.username || `User #${post.creatorId}`;
  const avatarUrl = post.imgUrl || post.avatarUrl || "";
  const avatarFallback =
    displayName
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .toUpperCase() || "U";

  const handleUpdate = async (formData: FormData) => {
    try {
      setSubmitting(true);

      // thêm list id media cần xóa vào formData (cho chắc)
      if (removedMediaIds.length > 0) {
        formData.set("removeMediaIds", removedMediaIds.join(","));
      }

      await updateBlog(formData);
      setEditing(false);
      setRemovedMediaIds([]);
      setNewFiles([]);
      onChanged?.();
    } catch (err) {
      console.error("Update post error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Xóa bài viết này?")) return;

    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("blogId", String(post.id));
      await deleteBlog(fd);
      onChanged?.();
    } catch (err) {
      console.error("Delete post error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const images = (post.media || []).filter(
    (m: any) => m.type === "image" && !removedMediaIds.includes(m.id),
  );
  const videos = (post.media || []).filter(
    (m: any) => m.type === "video" && !removedMediaIds.includes(m.id),
  );

  const handleNewFilesChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const list = Array.from(e.target.files || []);
    setNewFiles(list);
  };

  const renderNewFilesPreview = () => {
    if (!newFiles.length) return null;

    return (
      <div className="mt-2 grid grid-cols-2 gap-2">
        {newFiles.map((file, idx) => {
          const url = URL.createObjectURL(file);
          const isImage = file.type.startsWith("image/");
          const isVideo = file.type.startsWith("video/");

          return (
            <div
              key={idx}
              className="relative overflow-hidden rounded-lg border"
            >
              {isImage && (
                <Image
                  src={url}
                  alt={file.name}
                  width={500}
                  height={500}
                  className="h-40 w-full object-cover"
                />
              )}
              {isVideo && (
                <video
                  src={url}
                  controls
                  className="h-40 w-full object-cover"
                />
              )}
              {!isImage && !isVideo && (
                <div className="h-40 w-full px-2 py-1 text-xs">
                  {file.name}
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  setNewFiles((prev) =>
                    prev.filter((_, i) => i !== idx),
                  )
                }
                className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={displayName} />
            ) : null}
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <div className="text-sm font-semibold">{displayName}</div>
            <div className="text-xs text-muted-foreground">
              {createdAt}
            </div>
          </div>
        </div>

        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-muted"
                disabled={submitting}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-sm">
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setEditing(true);
                }}
              >
                Chỉnh sửa bài viết
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onSelect={(e) => {
                  e.preventDefault();
                  void handleDelete();
                }}
              >
                Xóa bài viết
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      <CardContent className="space-y-3 pb-2">
        {!editing ? (
          <>
            {post.text && (
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {post.text}
              </p>
            )}

            {/* nhiều ảnh */}
            {images.length > 0 && (
              <div
                className={`grid gap-1 overflow-hidden rounded-lg ${images.length === 1
                  ? "grid-cols-1"
                  : "grid-cols-2"
                  }`}
              >
                {images.map((m: any) => (
                  <Image
                    key={m.id}
                    src={m.url}
                    alt=""
                    width={1200}
                    height={800}
                    className="aspect-[16/9] w-full object-cover"
                  />
                ))}
              </div>
            )}

            {/* nhiều video */}
            {videos.length > 0 && (
              <div className="space-y-2">
                {videos.map((m: any) => (
                  <video
                    key={m.id}
                    src={m.url}
                    controls
                    className="max-h-[400px] w-full rounded-lg"
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <form
            action={handleUpdate}
            className="space-y-3"
            encType="multipart/form-data"
          >
            <input type="hidden" name="blogId" value={post.id} />
            <input
              type="hidden"
              name="removeMediaIds"
              value={removedMediaIds.join(",")}
            />

            <Textarea
              name="text"
              defaultValue={post.text || ""}
              className="min-h-[80px] text-sm"
              placeholder="Bạn đang nghĩ gì?"
            />

            {/* media hiện tại (có nút X để xóa) */}
            {(images.length > 0 || videos.length > 0) && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Ảnh / video hiện tại
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {(post.media || [])
                    .filter(
                      (m: any) =>
                        !removedMediaIds.includes(m.id),
                    )
                    .map((m: any) => (
                      <div
                        key={m.id}
                        className="relative overflow-hidden rounded-lg border"
                      >
                        {m.type === "image" ? (
                          <Image
                            src={m.url}
                            alt=""
                            width={500}
                            height={500}
                            className="h-32 w-full object-cover"
                          />
                        ) : (
                          <video
                            src={m.url}
                            controls
                            className="h-32 w-full object-cover"
                          />
                        )}

                        <Button
                          type="button"
                          onClick={() =>
                            setRemovedMediaIds((prev) =>
                              prev.includes(m.id)
                                ? prev
                                : [...prev, m.id],
                            )
                          }
                          className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full "
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* thêm media mới */}
            <div className="rounded-lg border px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs font-medium ">
                  <ImageIcon className="h-4 w-4" />
                  Thêm ảnh / video mới
                </span>
                <input
                  type="file"
                  name="newMedia"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleNewFilesChange}
                  className="text-xs"
                />
              </div>
              {renderNewFilesPreview()}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditing(false);
                  setRemovedMediaIds([]);
                  setNewFiles([]);
                }}
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-1 border-t px-2 pb-2 pt-1">
        <div className="flex items-center justify-between px-1 text-xs text-muted-foreground gap-3">
          <span>0 lượt thích</span>
          <span>0 bình luận</span>
        </div>
        <div className="mt-1 grid grid-cols-3 gap-4 text-xs">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center justify-center gap-1 rounded-md py-1 text-muted-foreground hover:bg-muted"
          >
            <ThumbsUp className="h-4 w-4" />
            Thích
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center justify-center gap-1 rounded-md py-1 text-muted-foreground hover:bg-muted"
          >
            <MessageCircle className="h-4 w-4" />
            Bình luận
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center justify-center gap-1 rounded-md py-1 text-muted-foreground hover:bg-muted"
          >
            <Share2 className="h-4 w-4" />
            Chia sẻ
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
