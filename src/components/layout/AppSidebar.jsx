import { BadgeCheck, BadgeCheckIcon, Bell, Calendar, ChevronsUpDown, CreditCard, Home, Inbox, LayoutDashboardIcon, LogOut, PlusCircle, Search, Settings, Sparkles, UsbIcon, User, User2Icon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useUser } from "@/context/AuthContext"
import { verifyToken } from "@/config/jwt";
import { cookies } from "next/headers";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getCookie } from "@/config/cookie";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { logout } from "@/service/public/auth/auth";
import { redirect } from "next/navigation";
import LogOutComponent from "./LogOut";
import { getInitials } from "@/lib/formatter";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Tickets",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Account Management",
    url: "/admin/account",
    icon: User2Icon,
  },
]

const shortcuts = [
  {
    title: "Add Account",
    url: "#",
    icon: PlusCircle,
  },
  {
    title: "Roles & Permissions",
    url: "#",
    icon: BadgeCheckIcon,
  }
]

export async function AppSidebar() {
  const cookie = await getCookie();
  const user = verifyToken(cookie);
  console.log(user, cookie);
  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="overflow-x-hidden">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.username} />
                      <AvatarFallback className="rounded-lg">{getInitials(user?.username)}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user?.username || "No Username"}</span>
                      <span className="truncate text-xs">{user?.role || "No Role"}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="min-w-56 rounded-lg"
                  side="right"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <User />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <LogOutComponent />
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarGroup>
          <SidebarGroupLabel>Main board</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Shortcuts</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {shortcuts.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* <SidebarFooter>
        <SidebarTrigger className="-ml-1" />
      </SidebarFooter> */}
    </Sidebar>

  )
}