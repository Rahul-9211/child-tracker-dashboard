"use client"

import * as React from "react"
import {
  Phone,
  MessageSquare,
  Bell,
  Smartphone,
  Map,
  Users,
  Activity,
  Settings2,
  Home,
} from "lucide-react"

import { NavMain } from "@/components/ui/nav-main"
import { NavUser } from "@/components/ui/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { auth } from "@/lib/auth-utils"

const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    isActive: true,
  },
  {
    title: "Device Info",
    url: "/device-info",
    icon: Smartphone,
  },
  {
    title: "Contacts",
    url: "/contacts",
    icon: Users,
  },
  {
    title: "Locations",
    url: "/locations",
    icon: Map,
  },
  {
    title: "Processes",
    url: "/process-activities",
    icon: Activity,
  },
  {
    title: "Applications",
    url: "/applications",
    icon: Smartphone,
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
  },
  {
    title: "SMS",
    url: "/sms",
    icon: MessageSquare,
  },
  {
    title: "Calls",
    url: "/calls",
    icon: Phone,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings2,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = auth.getUser()

  const userData = {
    name: user?.name || "User",
    email: user?.email || "user@example.com",
    avatar: "/avatars/default.jpg",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-center md:justify-start p-4">
          <h1 className="text-xl font-bold">PG</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
