"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/ui/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { auth } from "@/lib/auth-utils";
import { useRouter } from "next/navigation";

interface NotificationExtras {
  sender?: string;
  messageId?: string;
  [key: string]: string | undefined;
}

interface Notification {
  _id: string;
  deviceId: string;
  appPackageName: string;
  appName: string;
  title: string;
  text: string;
  timestamp: string;
  category: string;
  priority: string;
  isRead: boolean;
  isCleared: boolean;
  actions: string[];
  extras: NotificationExtras;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          auth.logout();
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/device/${localStorage.getItem('deviceId')}/unread`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            auth.logout();
            return;
          }
          throw new Error('Failed to fetch notifications');
        }
        
        const data = await response.json();
        setNotifications(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        if (err instanceof Error && err.message.includes('unauthorized')) {
          auth.logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [router]);

  return (
    <ProtectedRoute allowedRoles={["user", "admin"]}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Notifications</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <main className="p-6">
            {loading && <div>Loading notifications...</div>}
            {error && <div className="text-red-500">Error: {error}</div>}
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>App</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notification) => (
                    <TableRow key={notification._id}>
                      <TableCell className="font-medium">{notification.appName}</TableCell>
                      <TableCell>{notification.title}</TableCell>
                      <TableCell>{notification.text}</TableCell>
                      <TableCell>{new Date(notification.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {notification.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            notification.priority === 'high' ? 'destructive' : 
                            notification.priority === 'medium' ? 'default' : 'secondary'
                          }
                        >
                          {notification.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant={notification.isRead ? "secondary" : "default"}>
                            {notification.isRead ? "Read" : "Unread"}
                          </Badge>
                          <Badge variant={notification.isCleared ? "secondary" : "default"}>
                            {notification.isCleared ? "Cleared" : "Active"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {notification.actions.map((action, index) => (
                            <Badge key={index} variant="outline">
                              {action}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
} 