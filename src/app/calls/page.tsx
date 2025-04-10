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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

interface CallMetadata {
  location: Location;
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
}

interface CallResponse {
  callRecords: CallRecord[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

interface Device {
  _id: string;
  deviceId: string;
  deviceName: string;
}

export default function Calls() {
  const [callRecords, setCallRecords] = useState<CallRecord[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, logging out');
          auth.logout();
          return;
        }

        console.log('Fetching devices...');
        const response = await fetch('https://child-tracker-server.onrender.com/api/devices', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          console.error('Failed to fetch devices:', response.status, response.statusText);
          if (response.status === 401) {
            auth.logout();
            return;
          }
          throw new Error(`Failed to fetch devices: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Devices fetched:', data);
        setDevices(data || []);
        
        // If there's a device in localStorage, use it
        const storedDeviceId = localStorage.getItem('deviceId');
        if (storedDeviceId) {
          console.log('Using stored device ID:', storedDeviceId);
          setSelectedDevice(storedDeviceId);
        } else if (data?.length > 0) {
          // Otherwise, select the first device
          console.log('Selecting first device:', data[0]?.deviceId);
          setSelectedDevice(data[0]?.deviceId || '');
          localStorage.setItem('deviceId', data[0]?.deviceId || '');
        }
      } catch (err) {
        console.error('Error fetching devices:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    fetchDevices();
  }, []);

  useEffect(() => {
    if (!selectedDevice) {
      console.log('No device selected, skipping calls fetch');
      return;
    }

    const fetchCalls = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, logging out');
          auth.logout();
          return;
        }

        console.log('Fetching calls for device:', selectedDevice);
        setLoading(true);
        const response = await fetch(`https://child-tracker-server.onrender.com/api/calls/device/${selectedDevice}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          console.error('Failed to fetch calls:', response.status, response.statusText);
          if (response.status === 401) {
            auth.logout();
            return;
          }
          throw new Error(`Failed to fetch calls: ${response.status} ${response.statusText}`);
        }
        
        const data: CallResponse = await response.json();
        console.log('Calls data fetched:', data);
        setCallRecords(data?.callRecords || []);
        setPagination(data?.pagination || { total: 0, page: 1, pages: 1 });
        setError(null);
      } catch (err) {
        console.error('Error fetching calls:', err);
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
                    {callRecords.map((record) => (
                      <TableRow key={record?._id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{record?.metadata?.contactName || 'Unknown'}</span>
                            <span className="text-xs text-muted-foreground">
                              {record?.type === 'incoming' ? record?.caller : record?.receiver}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={record?.type === 'incoming' ? 'default' : 'secondary'}>
                            {record?.type || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDuration(record?.duration || 0)}</TableCell>
                        <TableCell>{record?.timestamp ? new Date(record.timestamp).toLocaleString() : 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              record?.status === 'completed' ? 'default' : 
                              record?.status === 'missed' ? 'destructive' : 'secondary'
                            }
                          >
                            {record?.status || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{record?.metadata?.location?.address || 'Unknown'}</span>
                            <span className="text-xs text-muted-foreground">
                              {record?.metadata?.location ? 
                                `${record.metadata.location.latitude}, ${record.metadata.location.longitude}` : 
                                'No location data'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {record?.metadata?.category || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={record?.metadata?.isSpam ? 'destructive' : 'secondary'}>
                            {record?.metadata?.isSpam ? 'Yes' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={record?.isBlocked ? 'destructive' : 'secondary'}>
                            {record?.isBlocked ? 'Yes' : 'No'}
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