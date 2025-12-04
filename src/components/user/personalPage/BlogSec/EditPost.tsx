import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { updateBlog } from '@/service/users/postActions';
import { Post } from '@/types/user/postT';
import { ImageIcon, X } from 'lucide-react';
import Image from 'next/image';
import React, { FormEvent, useRef, useState } from 'react'
import { toast } from 'sonner';

export default function EditPost({ post, refresh }: { post: Post, refresh: () => void }) {
    const images = post?.media.filter((m: any) => m.mediaType === 'image') || [];
    const videos = post?.media.filter((m: any) => m.mediaType === 'video') || [];
    const [submitting, setSubmitting] = useState(false);
    const [removedMediaIds, setRemovedMediaIds] = useState<number[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [editing, setEditing] = useState(false);
    const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        console.log("Form data entries:");
        for (const pair of formData.entries()) {
            console.log(`${pair[0]}:`, pair[1]);
        }
        try {
            setSubmitting(true);

            if (removedMediaIds.length > 0) {
                formData.set("removeMediaIds", removedMediaIds.join(","));
            }
            await updateBlog(formData);
            setEditing(false);
            setRemovedMediaIds([]);
            setNewFiles([]);
            refresh();
        } catch (err) {
            toast.error("Cập nhật thất bại");
        } finally {
            setSubmitting(false);
        }
    };
    const handleNewFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                        <div key={idx} className="relative overflow-hidden rounded-lg border">
                            {isImage && (
                                <Image
                                    src={url}
                                    alt={file.name}
                                    width={500}
                                    height={500}
                                    className="h-32 w-full object-cover"
                                />
                            )}
                            {isVideo && (
                                <video
                                    src={url}
                                    controls
                                    className="h-32 w-full object-cover"
                                />
                            )}
                            {!isImage && !isVideo && (
                                <div className="h-24 w-full bg-muted px-2 py-1 text-xs">
                                    {file.name}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() =>
                                    setNewFiles((prev) => prev.filter((_, i) => i !== idx))
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
        <Dialog open={editing} onOpenChange={setEditing}>
            <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Chỉnh sửa bài viết
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Sửa bài viết</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={handleUpdate}
                    className="space-y-3"
                    encType="multipart/form-data"
                    id='form'
                >
                    <input type="hidden" name="blogId" value={post.id} />
                    <input
                        type="hidden"
                        name="removeMediaIds"
                        value={removedMediaIds.join(",")}
                    />

                    <input
                        ref={fileInputRef}
                        type="file"
                        name="newMedia"
                        multiple
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleNewFilesChange}
                    />

                    <Textarea
                        name="text"
                        defaultValue={post.text || ""}
                        className="min-h-[80px] text-sm"
                    />

                    {(images.length > 0 || videos.length > 0) && (
                        <div className="space-y-2">
                            <div className="text-xs font-medium text-muted-foreground">
                                Ảnh / video hiện tại
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {(post.media || [])
                                    .filter((m: any) => !removedMediaIds.includes(m.id))
                                    .map((m: any) => (
                                        <div
                                            key={m.id}
                                            className="relative overflow-hidden rounded-lg border"
                                        >
                                            {m.mediaType === "image" ? (
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
                                                        prev.includes(m.id) ? prev : [...prev, m.id],
                                                    )
                                                }
                                                className="absolute right-1 top-1 h-6 w-6 rounded-full bg-background/30"
                                                variant="ghost"
                                                size="icon"
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    <div className="rounded-lg border  px-3 py-2">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                <ImageIcon className="h-4 w-4" />
                                Thêm ảnh / video mới
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Chọn file
                            </Button>
                        </div>
                        {renderNewFilesPreview()}
                    </div>
                </form>
                <DialogFooter>
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
                        >
                            Hủy
                        </Button>
                        <Button type="submit" size="sm" form="form" disabled={submitting}>
                            {submitting ? "Đang lưu..." : "Lưu"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
