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
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { auth } from "@/lib/auth-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Device {
  _id: string;
  deviceId: string;
  deviceName: string;
  model: string;
  manufacturer: string;
  osVersion: string;
  batteryLevel: number;
  lastSeen: string;
  isOnline: boolean;
}

export default function DeviceInfo() {
  const [device, setDevice] = useState<Device | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          auth.logout();
          return;
        }

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const endpoint = user.role === 'user' 
          ? `/devices/${user.allowedDevices[0]}`
          : '/devices';

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            auth.logout();
            return;
          }
          throw new Error('Failed to fetch devices');
        }

        const data = await response.json();
        // For user role, wrap single device in array to maintain consistent data structure
        const devicesData = user.role === 'user' ? [data] : data;
        setDevices(devicesData);
        
        const storedDeviceId = localStorage.getItem('deviceId');
        if (storedDeviceId) {
          setSelectedDevice(storedDeviceId);
        } else if (devicesData.length > 0) {
          setSelectedDevice(devicesData[0].deviceId);
          localStorage.setItem('deviceId', devicesData[0].deviceId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    fetchDevices();
  }, []);

  useEffect(() => {
    if (!selectedDevice) return;

    const fetchDeviceInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          auth.logout();
          return;
        }

        setLoading(true);
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const endpoint = user.role === 'user' 
          ? `/devices/${selectedDevice}`
          : `/devices/${selectedDevice}`;

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            auth.logout();
            return;
          }
          throw new Error('Failed to fetch device info');
        }
        
        const data = await response.json();
        setDevice(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceInfo();
  }, [selectedDevice]);

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDevice(deviceId);
    localStorage.setItem('deviceId', deviceId);
  };

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
                    <BreadcrumbPage>Device Info</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <main className="p-6">
            <div className="mb-4">
              <Select value={selectedDevice} onValueChange={handleDeviceChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select a device" />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((device) => (
                    <SelectItem key={device._id} value={device.deviceId}>
                      {device.deviceId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loading && <div>Loading device info...</div>}
            {error && <div className="text-red-500">Error: {error}</div>}
            
            {!selectedDevice && !loading && (
              <div className="text-center text-muted-foreground">
                Please select a device to view information
              </div>
            )}
            
            {device && !loading && !error && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Device Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Name:</span> {device.deviceName}
                      </div>
                      <div>
                        <span className="font-medium">Model:</span> {device.model}
                      </div>
                      <div>
                        <span className="font-medium">Manufacturer:</span> {device.manufacturer}
                      </div>
                      <div>
                        <span className="font-medium">OS Version:</span> {device.osVersion}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Status:</span>{" "}
                        <span className={device.isOnline ? "text-green-500" : "text-red-500"}>
                          {device.isOnline ? "Online" : "Offline"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Battery Level:</span> {device.batteryLevel}%
                      </div>
                      <div>
                        <span className="font-medium">Last Seen:</span>{" "}
                        {new Date(device.lastSeen).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
} 