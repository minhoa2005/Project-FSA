"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import Link from "next/link";

interface SharedPostCardProps {
  originalBlogId: number;
  originalText?: string;
  originalAuthor: {
    name: string;
    avatar?: string;
    username?: string;
    id?: number;
  };
  originalCreatorId?: number;
  originalCreatedAt: string;
  media?: Array<{ id: number; url: string; type: string }>;
}

export default function SharedPostCard({
  originalBlogId,
  originalText,
  originalAuthor,
  originalCreatedAt,
  originalCreatorId,
  media = [],
}: SharedPostCardProps) {
  const avatarFallback = originalAuthor?.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "U";

  const images = media?.filter((m) => m.type === "image") || [];
  const videos = media?.filter((m) => m.type === "video") || [];
  console.log(originalBlogId)
  return (
    <div className="border rounded-lg overflow-hidden mt-3">
      {originalBlogId ? (
        <>
          <Link href={`/personal/${originalCreatorId}`} className="p-3 flex items-center gap-2 border-b">
            <Avatar className="h-8 w-8">
              {originalAuthor?.avatar ? (
                <AvatarImage src={originalAuthor?.avatar} alt={originalAuthor?.name} />
              ) : null}
              <AvatarFallback className="text-xs">{avatarFallback}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{originalAuthor?.username}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(originalCreatedAt).toLocaleString("vi-VN")}
              </p>
            </div>
          </Link>

          {/* Original Content */}
          <div className="p-3 space-y-2 ">
            {originalText && (
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {originalText}
              </p>
            )}

            {/* Images */}
            {images.length > 0 && (
              <div
                className={`grid gap-1 overflow-hidden rounded-lg ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"
                  }`}
              >
                {images.map((m) => (
                  <div key={m.id} className="relative aspect-video ">
                    <Image
                      src={m.url}
                      alt=""
                      fill
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Videos */}
            {videos.length > 0 && (
              <div className="space-y-2">
                {videos.map((m) => (
                  <video
                    key={m.id}
                    src={m.url}
                    controls
                    className="w-full rounded-lg max-h-[300px]"
                  />
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="p-3 text-sm text-muted-foreground text-center">Bài viết gốc không còn tồn tại.</div>
      )
      }
      {/* Original Author Header */}

    </div>
  );
}