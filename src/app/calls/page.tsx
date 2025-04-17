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

interface CallLocation {
  latitude: number;
  longitude: number;
  address: string;
}

interface CallMetadata {
  location: CallLocation;
  contactName: string;
  isSpam: boolean;
  category: string;
  recordingUrl: string;
}

interface CallRecord {
  metadata: CallMetadata;
  _id: string;
  deviceId: string;
  callId: string;
  caller: string;
  receiver: string;
  duration: number;
  type: string;
  status: string;
  isBlocked: boolean;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CallPagination {
  total: number;
  page: number;
  pages: number;
}

interface CallResponse {
  callRecords: CallRecord[];
  pagination: CallPagination;
}

interface Device {
  _id: string;
  deviceId: string;
  deviceName: string;
}

export default function Calls() {
  const [callRecords, setCallRecords] = useState<CallRecord[]>([]);
  const [pagination, setPagination] = useState<CallPagination>({ total: 0, page: 1, pages: 1 });
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

    const fetchCalls = async () => {
      try {
        setLoading(true);
        const data = await apiService.getCalls(selectedDevice);
        setCallRecords(data.callRecords);
        setPagination(data.pagination);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, [selectedDevice]);

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDevice(deviceId);
    localStorage.setItem('deviceId', deviceId);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
                    <BreadcrumbPage>Calls</BreadcrumbPage>
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

            {loading && <div>Loading call records...</div>}
            {error && <div className="text-red-500">Error: {error}</div>}
            
            {!selectedDevice && !loading && (
              <div className="text-center text-muted-foreground">
                Please select a device to view call records
              </div>
            )}
            
            {selectedDevice && !loading && !error && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Spam</TableHead>
                      <TableHead>Blocked</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {callRecords.map((call) => (
                      <TableRow key={call._id}>
                        <TableCell className="font-medium">
                          {call.metadata?.contactName || (call.type === 'incoming' ? call.caller : call.receiver)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={call.type === 'incoming' ? 'default' : 'secondary'}>
                            {call.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDuration(call.duration)}</TableCell>
                        <TableCell>{new Date(call.timestamp).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {call.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{call.metadata?.location?.address || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {call.metadata?.category || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={call.metadata?.isSpam ? "destructive" : "default"}>
                            {call.metadata?.isSpam ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={call.isBlocked ? "destructive" : "default"}>
                            {call.isBlocked ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
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