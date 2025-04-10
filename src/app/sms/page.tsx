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
}

interface SMSResponse {
  smsRecords: SMSRecord[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

const smsColumns = [
  {
    key: 'contact',
    header: 'Contact',
    render: (record: SMSRecord) => (
      <div className="flex flex-col">
        <span className="font-medium">{record.metadata.contactName}</span>
        <span className="text-xs text-muted-foreground">
          {record.type === 'incoming' ? record.sender : record.receiver}
        </span>
      </div>
    )
  },
  {
    key: 'type',
    header: 'Type',
    render: (record: SMSRecord) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        record.type === 'incoming' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
      }`}>
        {record.type}
      </span>
    )
  },
  {
    key: 'message',
    header: 'Message',
    render: (record: SMSRecord) => record.message
  },
  {
    key: 'timestamp',
    header: 'Time',
    render: (record: SMSRecord) => new Date(record.timestamp).toLocaleString()
  },
  {
    key: 'status',
    header: 'Status',
    render: (record: SMSRecord) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        record.status === 'delivered' ? 'bg-green-100 text-green-800' :
        record.status === 'failed' ? 'bg-red-100 text-red-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {record.status}
      </span>
    )
  },
  {
    key: 'category',
    header: 'Category',
    render: (record: SMSRecord) => (
      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
        {record.metadata.category}
      </span>
    )
  },
  {
    key: 'spam',
    header: 'Spam',
    render: (record: SMSRecord) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        record.metadata.isSpam ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {record.metadata.isSpam ? 'Yes' : 'No'}
      </span>
    )
  },
  {
    key: 'blocked',
    header: 'Blocked',
    render: (record: SMSRecord) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        record.isBlocked ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {record.isBlocked ? 'Yes' : 'No'}
      </span>
    )
  }
];

export default function SMS() {
  const [smsRecords, setSmsRecords] = useState<SMSRecord[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { selectedDevice, setSelectedDevice, loading: deviceLoading, error: deviceError } = useDevice();

  useEffect(() => {
    if (!selectedDevice) {
      setLoading(false);
      return;
    }

    const fetchSMS = async () => {
      try {
        setLoading(true);
        const { data, error } = await fetchWithAuth<SMSResponse>(`sms/device/${selectedDevice}`);
        
        if (error) {
          setError(error);
          return;
        }

        setSmsRecords(data.smsRecords || []);
        setPagination(data.pagination || { total: 0, page: 1, pages: 1 });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSMS();
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
                    <BreadcrumbPage>SMS</BreadcrumbPage>
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

            {(loading || deviceLoading) && <div>Loading SMS records...</div>}
            {(error || deviceError) && <div className="text-red-500">Error: {error || deviceError}</div>}
            
            {!selectedDevice && !loading && !deviceLoading && (
              <div className="text-center text-muted-foreground">
                Please select a device to view SMS records
              </div>
            )}
            
            {selectedDevice && !loading && !deviceLoading && !error && !deviceError && (
              <DataTable
                data={smsRecords}
                columns={smsColumns}
                emptyMessage="No SMS records found"
              />
            )}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
} 