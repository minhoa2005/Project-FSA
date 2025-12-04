// src/lib/formatTimeAgo.ts
export function formatTimeAgo(date: string | Date): string {
  const now = new Date();
  const target = typeof date === "string" ? new Date(date) : date;

  // Kiểm tra ngày không hợp lệ
  if (isNaN(target.getTime())) return "Vừa xong";

  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Vừa xong";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return "Hôm qua";
  }
  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  }

  // Từ 7 ngày trở lên → hiển thị ngày tháng
  const day = target.getDate().toString().padStart(2, "0");
  const month = (target.getMonth() + 1).toString().padStart(2, "0");
  const year = target.getFullYear();

  return `${day}/${month}/${year}`;
}