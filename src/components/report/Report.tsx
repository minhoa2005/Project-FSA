'use client'
import React, { useState, useEffect } from 'react'
import { getReport, type Report } from '@/service/users/report'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function Report() {
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)
    const fetchReports = async () => {
        try {
            const data = await getReport()
            setReports(data)
        } catch (error) {
            console.error('Lỗi lấy báo cáo:', error)
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {

        fetchReports()
    }, [])

    if (loading) return <div>Đang tải...</div>

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Báo cáo</h1>
            {reports.length === 0 ? (
                <p>Không có báo cáo nào</p>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-100">
                                <TableHead className="font-bold">Blog ID</TableHead>
                                <TableHead className="font-bold">Lý do</TableHead>
                                <TableHead className="font-bold">Trạng thái</TableHead>
                                <TableHead className="font-bold">Ngày tạo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reports.map((report, idx) => (
                                <TableRow key={idx} className="hover:bg-gray-50">
                                    <TableCell>{report.blogId}</TableCell>
                                    <TableCell>{report.reason}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded text-sm ${
                                            report.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                            {report.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>{new Date(report.createdAt).toLocaleString('vi-VN')}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
