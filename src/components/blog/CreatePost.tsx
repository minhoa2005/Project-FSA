"use client";

import { useRef, useState } from "react";
import { createBlog } from "@/service/users/postActions";

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

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []);
    setFiles(list);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index);

      // cập nhật lại FileList của input thật
      if (fileInputRef.current) {
        const dt = new DataTransfer();
        newFiles.forEach((f) => dt.items.add(f));
        fileInputRef.current.files = dt.files;
      }

      return newFiles;
    });
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      setSubmitting(true);

      formData.set("creatorId", String(currentUser.id));

      await createBlog(formData);

      setContent("");
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setOpen(false);
      onPostCreated?.();
    } catch (err) {
      console.error("Create post error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderPreviews = () => {
    if (!files.length) return null;

    return (
      <div className="mt-3 grid grid-cols-2 gap-2">
        {files.map((file, idx) => {
          const url = URL.createObjectURL(file);

          const mediaPreview =
            file.type.startsWith("image/") ? (
              <img
                src={url}
                alt={file.name}
                className="h-40 w-full object-cover"
              />
            ) : file.type.startsWith("video/") ? (
              <video
                src={url}
                controls
                className="h-40 w-full object-cover"
              />
            ) : (
              <div className="h-40 w-full bg-muted px-2 py-1 text-xs">
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
    <Card className="mb-4 rounded-xl bg-white shadow-sm">
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
              <button
                type="button"
                className="flex-1 rounded-full border border-gray-200 bg-gray-100 px-4 py-2 text-left text-sm text-muted-foreground hover:bg-gray-200"
              >
                {displayName} ơi, bạn đang nghĩ gì thế?
              </button>
            </DialogTrigger>
          </div>

          {/* Hàng dưới: các nút kiểu FB */}
          <div className="mt-2 flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
            <DialogTrigger asChild>
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-2 rounded-md px-2 py-2 hover:bg-gray-100"
              >
                <ImageIcon className="h-4 w-4" />
                <span>Ảnh/Video</span>
              </button>
            </DialogTrigger>

            <div className="flex flex-1 items-center justify-end gap-1">
              <button
                type="button"
                className="flex items-center gap-1 rounded-md px-2 py-2 hover:bg-gray-100"
              >
                <Users className="h-4 w-4" />
                <span>Tag</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1 rounded-md px-2 py-2 hover:bg-gray-100"
              >
                <Smile className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* POPUP TẠO BÀI VIẾT */}
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-center text-base font-semibold">
                Tạo bài viết
              </DialogTitle>
            </DialogHeader>

            <form
              action={handleSubmit}
              encType="multipart/form-data"
              className="space-y-4"
            >
              {/* input file ẩn – để click bằng nút "Ảnh/Video" */}
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
                  <button
                    type="button"
                    className="mt-1 inline-flex items-center gap-1 rounded-md bg-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-700"
                  >
                    <Users className="h-3 w-3" />
                    Bạn bè
                  </button>
                </div>
              </div>

              {/* Textarea */}
              <Textarea
                name="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`${displayName} ơi, bạn đang nghĩ gì thế?`}
                className="min-h-[140px] resize-none border-0 p-0 text-lg focus-visible:ring-0"
              />

              {/* thêm vào bài viết + nút chọn media */}
              <div className="rounded-xl border bg-gray-50 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Thêm vào bài viết của bạn
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-200"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-200"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-200"
                    >
                      <Smile className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-200"
                    >
                      <MapPin className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {renderPreviews()}
              </div>

              {/* Nút Đăng (mờ khi không có nội dung) */}
              <div className="pt-1">
                <Button
                  type="submit"
                  className="w-full font-semibold"
                  disabled={!canSubmit}
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
