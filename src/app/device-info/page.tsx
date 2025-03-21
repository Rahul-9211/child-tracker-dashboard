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

interface Device {
  _id: string;
  deviceId: string;
  deviceName: string;
  deviceType: string;
  osVersion: string;
  manufacturer: string;
  lastConnected: string;
  status: string;
  childId: string;
  batteryLevel: number;
  installedApps: Array<{
    appName: string;
    packageName: string;
    isRestricted: boolean;
    _id: string;
  }>;
  settings: {
    screenTimeLimit: number;
    geofenceRadius: number;
    allowedApps: string[];
    blockedWebsites: string[];
  };
}

export default function DeviceInfo() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        // Get token from auth utility
        const token = localStorage.getItem('token');
        if (!token) {
          auth.logout();
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/devices/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            // If unauthorized, clear everything and redirect to login
            auth.logout();
            return;
          }
          throw new Error('Failed to fetch devices');
        }
        
        const data = await response.json();
        setDevices(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        if (err instanceof Error && err.message.includes('unauthorized')) {
          auth.logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
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
                    <BreadcrumbPage>Device Info</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <main className="p-6">
            {loading && <div>Loading devices...</div>}
            {error && <div className="text-red-500">Error: {error}</div>}
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device Name</TableHead>
                    <TableHead>Device ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>OS Version</TableHead>
                    <TableHead>Manufacturer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Battery</TableHead>
                    <TableHead>Last Connected</TableHead>
                    <TableHead>Settings</TableHead>
                    <TableHead>Apps</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device._id}>
                      <TableCell className="font-medium">{device.deviceName}</TableCell>
                      <TableCell>{device.deviceId}</TableCell>
                      <TableCell>{device.deviceType}</TableCell>
                      <TableCell>{device.osVersion}</TableCell>
                      <TableCell>{device.manufacturer}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={device.status === 'active' ? 'default' : 'secondary'}
                          className={device.status === 'active' ? 'bg-green-500' : 'bg-red-500'}
                        >
                          {device.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={device.batteryLevel > 20 ? 'default' : 'destructive'}
                        >
                          {device.batteryLevel}%
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(device.lastConnected).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>Screen Time: {device.settings.screenTimeLimit}min</p>
                          <p>Geofence: {device.settings.geofenceRadius}m</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] space-y-1">
                          {device.installedApps.map((app) => (
                            <Badge 
                              key={app._id}
                              variant={app.isRestricted ? 'destructive' : 'default'}
                              className="mr-1"
                            >
                              {app.appName}
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