'use server';
import { connectDB } from "@/config/db";
import { verifyUser } from "./personalInfo";
import { unauthorized } from "next/navigation";

const pool = await connectDB();

type ReportPayload  = {
  blogId: number;
  reason: string;
}

export async function insertReport(data : ReportPayload) : Promise<number> {
  if (!await verifyUser()) {
    unauthorized();
  }
  console.log('insertReport data:', data)
  try {

    const result = await pool.request()
    .input("blogId", data.blogId)
    .input("reason", data.reason)
    .query(`
        INSERT INTO Reports (blogId, reason)
        VALUES (@blogId, @reason)
    `)
    console.log('Report inserted:', result.rowsAffected[0])
    return result.rowsAffected[0];
  } catch (error) {
    console.error('Lỗi lấy bài viết:', error)
    return 0;
  }
}
