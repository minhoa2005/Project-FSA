"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

interface SharedPostCardProps {
  originalBlogId: number;
  originalText?: string;
  originalAuthor: {
    name: string;
    avatar?: string;
    username?: string;
  };
  originalCreatedAt: string;
  media?: Array<{ id: number; url: string; type: string }>;
}

export default function SharedPostCard({
  originalBlogId,
  originalText,
  originalAuthor,
  originalCreatedAt,
  media = [],
}: SharedPostCardProps) {
  const avatarFallback = originalAuthor.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "U";

  const images = media.filter((m) => m.type === "image");
  const videos = media.filter((m) => m.type === "video");

  return (
    <div className="border rounded-lg overflow-hidden bg-gray-50/50 mt-3">
      {/* Original Author Header */}
      <div className="p-3 flex items-center gap-2 bg-white/80 border-b">
        <Avatar className="h-8 w-8">
          {originalAuthor.avatar ? (
            <AvatarImage src={originalAuthor.avatar} alt={originalAuthor.name} />
          ) : null}
          <AvatarFallback className="text-xs">{avatarFallback}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{originalAuthor.name}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(originalCreatedAt).toLocaleString("vi-VN")}
          </p>
        </div>
      </div>

      {/* Original Content */}
      <div className="p-3 space-y-2 bg-white">
        {originalText && (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {originalText}
          </p>
        )}

        {/* Images */}
        {images.length > 0 && (
          <div
            className={`grid gap-1 overflow-hidden rounded-lg ${
              images.length === 1 ? "grid-cols-1" : "grid-cols-2"
            }`}
          >
            {images.map((m) => (
              <div key={m.id} className="relative aspect-video bg-gray-200">
                <Image
                  src={m.url}
                  alt=""
                  fill
                  className="object-cover"
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
    </div>
  );
}