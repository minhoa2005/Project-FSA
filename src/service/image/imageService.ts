import { imageKit } from "@/config/imageKit"


const upload = async (data: string, name: string) => {
    try {
        if (!data || !data.startsWith('data:')) {
            return {
                success: false,
                message: "Không có dữ liệu ảnh hợp lệ"
            }
        }
        const upload = await imageKit.upload({
            file: data,
            fileName: name,
            useUniqueFileName: true,
        })
        return { success: true, upload }
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: "Tải ảnh lên thất bại"
        }
    }
}

const uploadBytes = async (bytes: Buffer, name: string) => {
    try {
        if (!bytes || bytes.length === 0) {
            return {
                success: false,
                message: "Không có dữ liệu hợp lệ"
            }
        }
        const upload = await imageKit.upload({
            file: bytes,
            fileName: name,
            useUniqueFileName: true,
        })
        return { success: true, url: upload.url }
    }
    catch (error) {
        console.log(error);
        return {
            success: false,
            message: "Tải lên thất bại"
        }
    }
}

export { upload, uploadBytes };