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

export { upload };