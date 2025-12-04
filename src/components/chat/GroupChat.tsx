"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";
import { getFollowingUsers } from "@/service/users/chat";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "@/lib/formatter";
import { toast } from "sonner";
import { createGroup } from "@/service/users/groupchat";

export default function GroupChat() {
  const router = useRouter();

  const [allContacts, setAllContacts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
  });

  // Load list bạn bè
  useEffect(() => {
    getFollowingUsers().then((users) => {
      const mapped = users.map((user: any) => ({
        id: user.id,
        name: user.username,
        avatar: user.imgUrl || null,
      }));
      setAllContacts(mapped);
    });
  }, []);

  // Filter dựa vào search + không trùng người đã chọn
  const filteredContacts = useMemo(() => {
    return allContacts
      .filter((c) =>
        c.name.toLowerCase().includes(search.trim().toLowerCase())
      )
      .filter((c) => !group.some((g) => g.id === c.id));
  }, [allContacts, search, group]);

  const addToGroup = (user: any) => {
    setGroup((prev) => [...prev, user]);
  };

  const removeFromGroup = (user: any) => {
    setGroup((prev) => prev.filter((u) => u.id !== user.id));
  };

  // Tạo group
  const handleCreateGroup = async (e: any) => {
    e.preventDefault();

    if (!form.name.trim()) return toast.error("Tên nhóm không được để trống");

    if (group.length < 3)
      return toast.error("Group phải có ít nhất 3 thành viên");

    const memberIds = group.map((u) => u.id);

    const result = await createGroup(form.name, memberIds);

    if (!result.success) {
      toast.error("Lỗi khi tạo group");
      return;
    }

    toast.success("Tạo group thành công!");

    // Reset form
    setGroup([]);
    setForm({ name: "" });``
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Tạo Group Chat Mới
      </h2>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT — Danh sách user */}
        <div className="bg-white rounded-xl shadow-md p-4 border">
          <Input
            placeholder="Tìm kiếm người dùng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />

          <div className="max-h-[500px] overflow-y-auto pr-1">
            {filteredContacts.map((user) => (
              <div
                key={user.id}
                className="
                  flex items-center justify-between p-3 rounded-lg mb-2
                  hover:bg-gray-100 transition shadow-sm border
                "
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border shadow">
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} />
                    ) : (
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    )}
                  </Avatar>
                  <span className="font-medium text-gray-800">{user.name}</span>
                </div>

                <Button onClick={() => addToGroup(user)} className="px-4">
                  Thêm
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Danh sách đã chọn */}
        <div className="bg-white rounded-xl shadow-md p-4 border">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">
            Thành viên đã chọn
          </h3>

          {/* Input name group */}
          <Input
            placeholder="Tên nhóm..."
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
            className="mb-4"
          />

          <div className="max-h-[450px] overflow-y-auto pr-1 mb-4">
            {group.map((user) => (
              <div
                key={user.id}
                className="
                  flex items-center justify-between p-3 rounded-lg mb-2
                  bg-gray-50 border shadow-sm
                "
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border shadow">
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} />
                    ) : (
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    )}
                  </Avatar>
                  <span className="font-medium text-gray-800">{user.name}</span>
                </div>

                <Button
                  variant="destructive"
                  onClick={() => removeFromGroup(user)}
                  className="px-4"
                >
                  Xóa
                </Button>
              </div>
            ))}
          </div>

          <Button onClick={handleCreateGroup} className="w-full">
            Tạo Group
          </Button>
        </div>
      </div>
    </div>
  );
}
