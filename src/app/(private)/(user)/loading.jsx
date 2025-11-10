import { Spinner } from "@/components/ui/spinner"

export default function Loading() {
    return (
        <div className="flex items-center h-screen justify-center">
            <Spinner size="large" className={"w-10 h-10"} />
        </div>
    )
}
