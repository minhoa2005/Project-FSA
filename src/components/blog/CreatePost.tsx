// FILE: components/blog/CreatePost.tsx
"use client";

import { useRef, useState } from "react";
import { createBlog } from "@/service/users/postActions";
import type { FormEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Image as ImageIcon,
  Users,
  Smile,
  MapPin,
  Camera,
  X,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface CurrentUser {
  id: number;
  username?: string;
  fullName?: string;
  imgUrl?: string;
  avatarUrl?: string;
  [key: string]: any;
}

interface CreatePostBoxProps {
  currentUser: CurrentUser;
  onPostCreated?: () => void;
}

export default function CreatePostBox({
  currentUser,
  onPostCreated,
}: CreatePostBoxProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const displayName = currentUser.fullName || currentUser.username || "Bạn";
  const avatarUrl = currentUser.imgUrl || currentUser.avatarUrl || "";
  const avatarFallback =
    displayName
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .toUpperCase() || "U";

  const canSubmit =
    !submitting &&
    (content.trim().length > 0 || (files && files.length > 0));

  //  Chọn file (cho phép chọn nhiều lần, cộng dồn giống phần chỉnh sửa)
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    setFiles((prev) => {
      const merged = [...prev, ...selected];

      // đồng bộ lại FileList của input thật
      if (fileInputRef.current) {
        const dt = new DataTransfer();
        merged.forEach((f) => dt.items.add(f));
        fileInputRef.current.files = dt.files;
      }

      return merged;
    });

    // để user có thể chọn tiếp cùng input đó
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  //  Bỏ 1 file khi bấm X
  const handleRemoveFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index);

      if (fileInputRef.current) {
        const dt = new DataTransfer();
        newFiles.forEach((f) => dt.items.add(f));
        fileInputRef.current.files = dt.files;
      }

      return newFiles;
    });
  };

  // Submit form: dùng state `files` làm nguồn, đảm bảo gửi đủ nhiều file
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const formElem = e.currentTarget;
  const formData = new FormData(formElem);

  try {
    setSubmitting(true);

    formData.set("creatorId", String(currentUser.id));

    // override media bằng state files
    formData.delete("media");
    files.forEach((file) => {
      formData.append("media", file);
    });

    await createBlog(formData);

    toast.success("Đã tạo bài viết thành công!");
    setContent("");
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setOpen(false);
    onPostCreated?.();
  } catch (err) {
    console.error("Create post error:", err);
    toast.error("Tạo bài viết thất bại");
  } finally {
    setSubmitting(false);
  }
}; 

  // 👉 Hiển thị preview + nút X giống phần chỉnh sửa
  const renderPreviews = () => {
    if (!files.length) return null;

    return (
      <div className="mt-3 grid grid-cols-2 gap-2">
        {files.map((file, idx) => {
          const url = URL.createObjectURL(file);

          const mediaPreview = file.type.startsWith("image/") ? (
            <Image
              src={url}
              alt={file.name}
              className="h-40 w-full object-cover"
              width={160}
              height={160}
            />
          ) : file.type.startsWith("video/") ? (
            <video
              src={url}
              controls
              className="h-40 w-full object-cover"
            />
          ) : (
            <div className="h-40 w-full px-2 py-1 text-xs">
              {file.name}
            </div>
          );

          return (
            <div
              key={idx}
              className="relative overflow-hidden rounded-lg border"
            >
              {mediaPreview}
              {/* nút X để bỏ media */}
              <button
                type="button"
                onClick={() => handleRemoveFile(idx)}
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
    <Card className="mb-4 rounded-xl shadow-sm">
      <CardContent className="space-y-3 pt-4">
        <Dialog
          open={open}
          onOpenChange={(v) => {
            if (!submitting) setOpen(v);
          }}
        >
          {/* Hàng trên: avatar + ô “Bạn đang nghĩ gì thế?” */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={displayName} />
              ) : null}
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>

            <DialogTrigger asChild>
              <Button
                type="button"
                className="flex-1 rounded-full border px-4 py-2 text-left text-sm text-muted-foreground"
                variant="outline"
              >
                {displayName} ơi, bạn đang nghĩ gì thế?
              </Button>
            </DialogTrigger>
          </div>

          {/* Hàng dưới: nút Ảnh/Video kiểu FB */}
          <div className="mt-2 flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
            <DialogTrigger asChild>
              <Button
                type="button"
                className="flex flex-1 items-center justify-center gap-2 rounded-md px-2 py-2"
                variant="ghost"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
              >
                <ImageIcon className="h-4 w-4" />
                <span>Ảnh/Video</span>
              </Button>
            </DialogTrigger>

            {/* Có thể thêm các nút khác sau này */}
          </div>

          {/* POPUP TẠO BÀI VIẾT */}
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-center text-base font-semibold">
                Tạo bài viết
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* input file ẩn – click bằng nút "Ảnh/Video" hoặc nút chọn file trong khung */}
              <input
                ref={fileInputRef}
                type="file"
                name="media"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFilesChange}
              />

              {/* User info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt={displayName} />
                  ) : null}
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">
                    {displayName}
                  </span>
                </div>
              </div>

              {/* Textarea */}
              <Textarea
                name="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`${displayName} ơi, bạn đang nghĩ gì thế ?`}
                className="min-h-[140px] resize-none text-lg"
              />

              {/* Khung Thêm vào bài viết + nút chọn file giống phần chỉnh sửa */}
              <div className="rounded-xl border px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Thêm vào bài viết của bạn
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full cursor-pointer"
                      variant="outline"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Preview ảnh/video + X */}
                {renderPreviews()}
              </div>

              {/* Nút Đăng (mờ khi không có nội dung) */}
              <div className="pt-1">
                <Button
                  type="submit"
                  className="w-full font-semibold"
                  disabled={!canSubmit}
                  variant="default"
                >
                  {submitting ? "Đang đăng..." : "Đăng"}
                </Button>
              </div>
            </form>

            {/* Nút đóng góc phải */}
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                className="absolute right-2 top-2 h-8 w-8 rounded-full p-0"
              >
                ✕
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
