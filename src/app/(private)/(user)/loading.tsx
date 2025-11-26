import { Spinner } from "@/components/ui/spinner"

export default function Loading() {
    return (
        <div className="flex items-center h-screen justify-center">
            <Spinner className={"size-8"} />
        </div>
    )
}
