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
}

const processActivitiesColumns = [
  {
    key: 'processName',
    header: 'Process Name',
    render: (activity: ProcessActivity) => activity.processName
  },
  {
    key: 'packageName',
    header: 'Package Name',
    render: (activity: ProcessActivity) => activity.packageName
  },
  {
    key: 'cpuUsage',
    header: 'CPU Usage',
    render: (activity: ProcessActivity) => `${activity.cpuUsage}%`
  },
  {
    key: 'memoryUsage',
    header: 'Memory Usage',
    render: (activity: ProcessActivity) => `${activity.memoryUsage} MB`
  },
  {
    key: 'priority',
    header: 'Priority',
    render: (activity: ProcessActivity) => activity.priority
  },
  {
    key: 'isActive',
    header: 'Status',
    render: (activity: ProcessActivity) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        activity.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {activity.isActive ? 'Active' : 'Inactive'}
      </span>
    )
  },
  {
    key: 'startTime',
    header: 'Start Time',
    render: (activity: ProcessActivity) => new Date(activity.startTime).toLocaleString()
  },
  {
    key: 'processId',
    header: 'Process ID',
    render: (activity: ProcessActivity) => activity.processId
  }
];

export default function ProcessActivities() {
  const [activities, setActivities] = useState<ProcessActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { selectedDevice, setSelectedDevice, loading: deviceLoading, error: deviceError } = useDevice();

  useEffect(() => {
    if (!selectedDevice) {
      setLoading(false);
      return;
    }

    const fetchActivities = async () => {
      try {
        setLoading(true);
        const { data, error } = await fetchWithAuth<ProcessActivity[]>(`process-activities/device/${selectedDevice}/active`);
        
        if (error) {
          setError(error);
          return;
        }

        setActivities(data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
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
                    <BreadcrumbPage>Process Activities</BreadcrumbPage>
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

            {(loading || deviceLoading) && <div>Loading process activities...</div>}
            {(error || deviceError) && <div className="text-red-500">Error: {error || deviceError}</div>}
            
            {!selectedDevice && !loading && !deviceLoading && (
              <div className="text-center text-muted-foreground">
                Please select a device to view process activities
              </div>
            )}
            
            {selectedDevice && !loading && !deviceLoading && !error && !deviceError && (
              <DataTable
                data={activities}
                columns={processActivitiesColumns}
                emptyMessage="No process activities found"
              />
            )}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
} 