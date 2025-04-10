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

interface Application {
  _id: string;
  deviceId: string;
  packageName: string;
  appName: string;
  startTime: string;
  isActive: boolean;
  lastUsed: string;
  usageCount: number;
  category: string;
}

const applicationsColumns = [
  {
    key: 'appName',
    header: 'App Name',
    render: (app: Application) => app.appName
  },
  {
    key: 'packageName',
    header: 'Package Name',
    render: (app: Application) => app.packageName
  },
  {
    key: 'startTime',
    header: 'Start Time',
    render: (app: Application) => new Date(app.startTime).toLocaleString()
  },
  {
    key: 'lastUsed',
    header: 'Last Used',
    render: (app: Application) => new Date(app.lastUsed).toLocaleString()
  },
  {
    key: 'usageCount',
    header: 'Usage Count',
    render: (app: Application) => app.usageCount
  },
  {
    key: 'isActive',
    header: 'Status',
    render: (app: Application) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        app.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {app.isActive ? 'Active' : 'Inactive'}
      </span>
    )
  },
  {
    key: 'category',
    header: 'Category',
    render: (app: Application) => app.category
  }
];

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { selectedDevice, setSelectedDevice, loading: deviceLoading, error: deviceError } = useDevice();

  useEffect(() => {
    if (!selectedDevice) {
      setLoading(false);
      return;
    }

    const fetchApplications = async () => {
      try {
        setLoading(true);
        const { data, error } = await fetchWithAuth<Application[]>(`applications/device/${selectedDevice}/active`);
        
        if (error) {
          setError(error);
          return;
        }

        setApplications(data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
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
                    <BreadcrumbPage>Applications</BreadcrumbPage>
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

            {(loading || deviceLoading) && <div>Loading applications...</div>}
            {(error || deviceError) && <div className="text-red-500">Error: {error || deviceError}</div>}
            
            {!selectedDevice && !loading && !deviceLoading && (
              <div className="text-center text-muted-foreground">
                Please select a device to view applications
              </div>
            )}
            
            {selectedDevice && !loading && !deviceLoading && !error && !deviceError && (
              <DataTable
                data={applications}
                columns={applicationsColumns}
                emptyMessage="No applications found"
              />
            )}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
} 