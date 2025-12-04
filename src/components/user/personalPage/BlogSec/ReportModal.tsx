'use client';
import React, { useState } from 'react';
import { Flag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { insertReport } from '@/service/users/report';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';


const REPORT_REASONS = [
    "Vấn đề liên quan đến người dưới 18 tuổi",
    "Bắt nạt, quấy rối hoặc lăng mạ/lạm dụng/ngược đãi",
    "Tự tử hoặc tự hại bản thân",
    "Nội dung mang tính bạo lực, thù ghét hoặc gây phiền toái",
    "Bán hoặc quảng cáo mặt hàng bị hạn chế",
    "Nội dung người lớn",
    "Thông tin sai sự thật, lừa đảo hoặc gian lận",
    "Quyền sở hữu trí tuệ",
    "Chỉ là tôi không thích nội dung này",
];

const ReportModal = ({ blogId }) => {

    const [step, setStep] = useState(1);
    const [selectedReason, setSelectedReason] = useState(null);
    const [open, setOpen] = useState(false);
    const handleBack = () => {
        setStep(1);
        setSelectedReason(null);
    };
    const handleReasonSelect = (reason) => {
        setSelectedReason(reason);
        setStep(2);
    };
    const handleFinalSubmit = async () => {
        if (!selectedReason) return;

        const reportData = {
            blogId: blogId,
            reason: selectedReason,
        };
        try {
            const res = await insertReport(reportData);
            if (res > 0) {
                toast.success("Báo cáo của bạn đã được gửi thành công.");
            } else {
                toast.error("Đã có lỗi xảy ra khi gửi báo cáo.");
            }
        } catch (error) {
            console.error("Lỗi mạng:", error);
        }

        setStep(1);
        setSelectedReason(null);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem className='w-full' onSelect={(e) => e.preventDefault()}>
                    <Flag className="h-4 w-4" /> Báo cáo bài viết
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogHeader>
                <DialogTitle></DialogTitle>
                <DialogDescription></DialogDescription>
            </DialogHeader>
            <DialogContent className="rounded-lg w-full max-w-md p-6 shadow-lg">
                <div className="flex justify-between items-center pb-4 border-b">
                    {step === 2 && (
                        <Button onClick={handleBack} className="p-1 rounded-full" variant='ghost'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </Button>
                    )}
                    <h2 className="text-xl font-bold">Báo cáo</h2>
                </div>
                {step === 1 ? (
                    <div className="mt-4">
                        <p className="font-semibold mb-2">Tại sao bạn báo cáo bài viết này?</p>
                        <div className='flex flex-col gap-2'>
                            {REPORT_REASONS.map((reason, index) => (
                                <Button
                                    key={index}
                                    className="w-full justify-between text-left"
                                    onClick={() => handleReasonSelect(reason)}
                                    variant='ghost'
                                >
                                    <span className="text-sm">{reason}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </Button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-4">Bạn sắp gửi báo cáo</h3>
                        <p className="text-sm  mb-6">
                            Chúng tôi chỉ gỡ nội dung vi phạm <a href="#" >Tiêu chuẩn cộng đồng</a> của mình.
                        </p>

                        <p className="text-md font-semibold mb-2">Chi tiết báo cáo</p>

                        <div className="p-3 border rounded-lg mb-6">
                            <div className="text-xs ">Lý do bạn đã chọn:</div>
                            <div className="font-medium">{selectedReason}</div>
                        </div>

                        <Button
                            onClick={handleFinalSubmit}
                            className="w-full py-3 font-bold "
                        >
                            Gửi
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ReportModal;