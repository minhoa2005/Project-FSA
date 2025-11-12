
import AdminHeader from "@/components/layout/AdminHeader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";


export default function Page() {
    return (
        <div>
            <header>
                <AdminHeader name="Dashboard" />
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4">

            </div>
        </div>
    );
}
