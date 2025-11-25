import { X, Share2, Send, Copy, Facebook, MessageCircle } from "lucide-react";

interface ShareDialogProps {
  onClose: () => void;
  onShare: (shareType: string) => void;
}

export function ShareDialog({ onClose, onShare }: ShareDialogProps) {
  const shareOptions = [
    {
      id: "timeline",
      icon: Share2,
      label: "Chia sẻ lên Dòng thời gian",
      description: "Chia sẻ lên trang cá nhân của bạn"
    },
    {
      id: "messenger",
      icon: Send,
      label: "Gửi qua Messenger",
      description: "Gửi bài viết này cho bạn bè"
    },
    {
      id: "copy",
      icon: Copy,
      label: "Sao chép liên kết",
      description: "Sao chép link bài viết"
    },
    {
      id: "page",
      icon: Facebook,
      label: "Chia sẻ lên Trang",
      description: "Chia sẻ lên trang của bạn"
    },
    {
      id: "group",
      icon: MessageCircle,
      label: "Chia sẻ trong nhóm",
      description: "Đăng lên nhóm bạn tham gia"
    }
  ];

  const handleShare = (shareType: string) => {
    if (shareType === "copy") {
      // Giả lập copy link
      navigator.clipboard.writeText(window.location.href);
      alert("Đã sao chép liên kết!");
    }
    onShare(shareType);
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-gray-900">Chia sẻ bài viết</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Share Options */}
        <div className="p-2">
          {shareOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => handleShare(option.id)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-gray-700" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-gray-900">{option.label}</p>
                  <p className="text-gray-600 text-sm">{option.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          <p className="text-gray-600 text-sm text-center">
            Chọn một tùy chọn để chia sẻ bài viết này
          </p>
        </div>
      </div>
    </>
  );
}
