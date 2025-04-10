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
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DeviceSelector } from "@/components/shared/device-selector";
import { DataTable } from "@/components/shared/data-table";
import { fetchWithAuth } from "@/lib/api-utils";
import { useDevice } from "@/hooks/use-device";

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
  createdAt: string;
  updatedAt: string;
}

const notificationsColumns = [
  {
    key: 'appName',
    header: 'App',
    render: (notification: Notification) => notification.appName
  },
  {
    key: 'title',
    header: 'Title',
    render: (notification: Notification) => notification.title
  },
  {
    key: 'text',
    header: 'Message',
    render: (notification: Notification) => (
      <div className="flex flex-col">
        <span>{notification.text}</span>
        {notification.extras.sender && (
          <span className="text-xs text-muted-foreground">
            From: {notification.extras.sender}
          </span>
        )}
      </div>
    )
  },
  {
    key: 'timestamp',
    header: 'Time',
    render: (notification: Notification) => new Date(notification.timestamp).toLocaleString()
  },
  {
    key: 'category',
    header: 'Category',
    render: (notification: Notification) => (
      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
        {notification.category}
      </span>
    )
  },
  {
    key: 'priority',
    header: 'Priority',
    render: (notification: Notification) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        notification.priority === 'high' ? 'bg-red-100 text-red-800' :
        notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {notification.priority}
      </span>
    )
  },
  {
    key: 'status',
    header: 'Status',
    render: (notification: Notification) => (
      <div className="space-y-1">
        <span className={`px-2 py-1 rounded-full text-xs ${
          notification.isRead ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {notification.isRead ? 'Read' : 'Unread'}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs ${
          notification.isCleared ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
        }`}>
          {notification.isCleared ? 'Cleared' : 'Active'}
        </span>
      </div>
    )
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (notification: Notification) => (
      <div className="flex flex-wrap gap-1">
        {notification.actions.map((action, index) => (
          <span key={index} className="px-2 py-1 rounded-full text-xs border border-gray-200">
            {action}
          </span>
        ))}
      </div>
    )
  }
];

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { selectedDevice, setSelectedDevice, loading: deviceLoading, error: deviceError } = useDevice();

  useEffect(() => {
    if (!selectedDevice) {
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const { data, error } = await fetchWithAuth<Notification[]>(`notifications/device/${selectedDevice}/unread`);
        
        if (error) {
          setError(error);
          return;
        }

        setNotifications(data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [selectedDevice]);

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
            <DeviceSelector 
              selectedDevice={selectedDevice} 
              onDeviceChange={setSelectedDevice} 
            />

            {(loading || deviceLoading) && <div>Loading notifications...</div>}
            {(error || deviceError) && <div className="text-red-500">Error: {error || deviceError}</div>}
            
            {!selectedDevice && !loading && !deviceLoading && (
              <div className="text-center text-muted-foreground">
                Please select a device to view notifications
              </div>
            )}
            
            {selectedDevice && !loading && !deviceLoading && !error && !deviceError && (
              <DataTable
                data={notifications}
                columns={notificationsColumns}
                emptyMessage="No notifications found"
              />
            )}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
} 