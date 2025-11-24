import { imageKit } from "@/config/imageKit"


const upload = async (data: FormData) => {
    try {
        const file = data.get("file");
        const name: string = data.get("name").toString();
        if (!file || !(file instanceof File)) {
            return {
                success: false,
                message: "No file provided or invalid file type"
            }
        }
        const buffer = Buffer.from(await file?.arrayBuffer()!);
        const upload = await imageKit.upload({
            file: buffer,
            fileName: data.get("fileName") as string,
            useUniqueFileName: true,
        })
        return upload
    } catch (error) {
        throw new Error(`Image upload failed: ${error}`)
    }
}