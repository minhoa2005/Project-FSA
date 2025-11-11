import { Spinner } from "@/components/ui/spinner"

export default function loading() {
    return (
        <div className="flex items-center h-[100vh] justify-center">
            <Spinner size="large" className={"w-10 h-10"} />
            
        </div>
    )
}
