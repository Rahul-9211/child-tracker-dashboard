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
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SMSMetadata {
  contactName: string;
  isSpam: boolean;
  category: string;
}

interface SMSRecord {
  metadata: SMSMetadata;
  _id: string;
  deviceId: string;
  messageId: string;
  sender: string;
  receiver: string;
  message: string;
  type: string;
  status: string;
  isBlocked: boolean;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface SMSPagination {
  total: number;
  page: number;
  pages: number;
}

// interface SMSResponse {
//   smsRecords: SMSRecord[];
//   pagination: SMSPagination;
// }

interface Device {
  _id: string;
  deviceId: string;
  deviceName: string;
}

export default function SMS() {
  const [smsRecords, setSMSRecords] = useState<SMSRecord[]>([]);
  const [pagination, setPagination] = useState<SMSPagination>({ total: 0, page: 1, pages: 1 });
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

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDevice(deviceId);
    localStorage.setItem('deviceId', deviceId);
    // Reset pagination when device changes
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  useEffect(() => {
    if (!selectedDevice) return;

    const fetchSMS = async () => {
      try {
        setLoading(true);
        const data = await apiService.getSMS(selectedDevice, pagination.page);
        setSMSRecords(data.smsRecords);
        setPagination(data.pagination);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSMS();
  }, [selectedDevice, pagination.page]);

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
                    <BreadcrumbPage>SMS</BreadcrumbPage>
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

            {loading && <div>Loading SMS records...</div>}
            {error && <div className="text-red-500">Error: {error}</div>}
            
            {!selectedDevice && !loading && (
              <div className="text-center text-muted-foreground">
                Please select a device to view SMS records
              </div>
            )}
            
            {selectedDevice && !loading && !error && (
              <div className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contact</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Spam</TableHead>
                        <TableHead>Blocked</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {smsRecords.map((sms) => (
                        <TableRow key={sms._id}>
                          <TableCell className="font-medium">
                            {sms.metadata.contactName || (sms.type === 'incoming' ? sms.sender : sms.receiver)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={sms.type === 'incoming' ? 'default' : 'secondary'}>
                              {sms.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{sms.message}</TableCell>
                          <TableCell>{new Date(sms.timestamp).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {sms.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {sms.metadata.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={sms.metadata.isSpam ? "destructive" : "default"}>
                              {sms.metadata.isSpam ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={sms.isBlocked ? "destructive" : "default"}>
                              {sms.isBlocked ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {smsRecords.length} of {pagination.total} records
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm">
                      Page {pagination.page} of {pagination.pages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
} 