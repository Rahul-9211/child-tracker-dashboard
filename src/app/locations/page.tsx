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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Location {
  _id: string;
  deviceId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number;
  speed: number;
  heading: number;
  timestamp: string;
  address: string;
  isMoving: boolean;
  batteryLevel: number;
  networkType: string;
}

interface Device {
  _id: string;
  deviceId: string;
  deviceName: string;
}

export default function Locations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          auth.logout();
          return;
        }

        const response = await fetch('https://child-tracker-server.onrender.com/api/devices', {
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
        setDevices(data);
        
        const storedDeviceId = localStorage.getItem('deviceId');
        if (storedDeviceId) {
          setSelectedDevice(storedDeviceId);
        } else if (data.length > 0) {
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

    const fetchLocations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          auth.logout();
          return;
        }

        setLoading(true);
        const response = await fetch(`https://child-tracker-server.onrender.com/api/locations/device/${selectedDevice}/latest`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            auth.logout();
            return;
          }
          throw new Error('Failed to fetch locations');
        }
        
        const data = await response.json();
        setLocations(Array.isArray(data) ? data : [data]);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
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
                    <BreadcrumbPage>Locations</BreadcrumbPage>
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

            {loading && <div>Loading locations...</div>}
            {error && <div className="text-red-500">Error: {error}</div>}
            
            {!selectedDevice && !loading && (
              <div className="text-center text-muted-foreground">
                Please select a device to view locations
              </div>
            )}
            
            {selectedDevice && !loading && !error && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Accuracy</TableHead>
                      <TableHead>Speed</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Battery</TableHead>
                      <TableHead>Network</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.map((location) => (
                      <TableRow key={location._id}>
                        <TableCell>{new Date(location.timestamp).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div>Lat: {location.latitude.toFixed(6)}</div>
                            <div>Lng: {location.longitude.toFixed(6)}</div>
                          </div>
                        </TableCell>
                        <TableCell>{location.address}</TableCell>
                        <TableCell>{location.accuracy}m</TableCell>
                        <TableCell>{location.speed} m/s</TableCell>
                        <TableCell>
                          <Badge variant={location.isMoving ? "default" : "secondary"}>
                            {location.isMoving ? "Moving" : "Stationary"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={location.batteryLevel > 20 ? "default" : "destructive"}
                          >
                            {location.batteryLevel}%
                          </Badge>
                        </TableCell>
                        <TableCell>{location.networkType}</TableCell>
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