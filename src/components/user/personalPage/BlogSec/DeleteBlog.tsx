"use client"
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { deleteBlog } from '@/service/users/postActions';
import { Post } from '@/types/user/postT';
import React from 'react'
import { toast } from 'sonner';

export default function DeleteBlog({ post, refresh }: { post: Post, refresh: () => void }) {
    const handleDelete = async () => {
        try {
            const fd = new FormData();
            fd.append("blogId", String(post.id));
            await deleteBlog(fd);
            refresh();
            toast.success("Xoá thành công");
        } catch (err) {
            toast.error("Xoá thất bại");
        }
    };
    return (
        <DropdownMenuItem
            className="text-destructive"
            onSelect={() =>
                toast("Xoá?", {
                    action: { label: "Xoá", onClick: handleDelete },
                    position: "top-center",
                })
            }
        >
            Xoá bài viết
        </DropdownMenuItem>
    )
}
