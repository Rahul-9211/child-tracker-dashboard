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
import { apiService } from "@/lib/api-service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProcessActivity {
  _id: string;
  deviceId: string;
  processName: string;
  packageName: string;
  startTime: string;
  cpuUsage: number;
  memoryUsage: number;
  isActive: boolean;
  priority: string;
  userId: number;
  processId: number;
  parentProcessId: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Device {
  _id: string;
  deviceId: string;
  deviceName: string;
}

export default function ProcessActivities() {
  const [processes, setProcesses] = useState<ProcessActivity[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const data = await apiService.getDevices();
        setDevices(data);
        
        // If there's a device in localStorage, use it
        const storedDeviceId = localStorage.getItem('deviceId');
        if (storedDeviceId) {
          setSelectedDevice(storedDeviceId);
        } else if (data.length > 0) {
          // Otherwise, select the first device
          setSelectedDevice(data[0].deviceId);
          localStorage.setItem('deviceId', data[0].deviceId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    fetchDevices();
  }, []);

  useEffect(() => {
    if (!selectedDevice) return;

    const fetchProcesses = async () => {
      try {
        setLoading(true);
        const data = await apiService.getProcessActivities(selectedDevice);
        setProcesses(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProcesses();
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
                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Process Activities</BreadcrumbPage>
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

            {loading && <div>Loading process activities...</div>}
            {error && <div className="text-red-500">Error: {error}</div>}
            
            {!selectedDevice && !loading && (
              <div className="text-center text-muted-foreground">
                Please select a device to view process activities
              </div>
            )}
            
            {selectedDevice && !loading && !error && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Process Name</TableHead>
                      <TableHead>Package Name</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>CPU Usage</TableHead>
                      <TableHead>Memory Usage</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Process ID</TableHead>
                      <TableHead>Parent Process ID</TableHead>
                      <TableHead>User ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processes.map((process) => (
                      <TableRow key={process._id}>
                        <TableCell className="font-medium">{process.processName}</TableCell>
                        <TableCell>{process.packageName}</TableCell>
                        <TableCell>{new Date(process.startTime).toLocaleString()}</TableCell>
                        <TableCell>{process.cpuUsage.toFixed(2)}%</TableCell>
                        <TableCell>{process.memoryUsage} MB</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{process.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={process.isActive ? "default" : "destructive"}>
                            {process.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{process.processId}</TableCell>
                        <TableCell>{process.parentProcessId}</TableCell>
                        <TableCell>{process.userId}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
} 