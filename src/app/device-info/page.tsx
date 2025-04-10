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

interface InstalledApp {
  appName: string;
  packageName: string;
  isRestricted: boolean;
  _id: string;
}

interface DeviceSettings {
  screenTimeLimit: number;
  geofenceRadius: number;
  allowedApps: string[];
  blockedWebsites: string[];
}

interface DeviceInfo {
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
  installedApps: InstalledApp[];
  settings: DeviceSettings;
  createdAt: string;
  updatedAt: string;
}

const deviceInfoColumns = [
  {
    key: 'deviceName',
    header: 'Device Name',
    render: (info: DeviceInfo) => (
      <div className="flex flex-col">
        <span className="font-medium">{info.deviceName}</span>
        <span className="text-sm text-muted-foreground">{info.deviceId}</span>
      </div>
    )
  },
  {
    key: 'deviceType',
    header: 'Device Type',
    render: (info: DeviceInfo) => info.deviceType
  },
  {
    key: 'osVersion',
    header: 'OS Version',
    render: (info: DeviceInfo) => info.osVersion
  },
  {
    key: 'manufacturer',
    header: 'Manufacturer',
    render: (info: DeviceInfo) => info.manufacturer
  },
  {
    key: 'status',
    header: 'Status',
    render: (info: DeviceInfo) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        info.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {info.status}
      </span>
    )
  },
  {
    key: 'batteryLevel',
    header: 'Battery Level',
    render: (info: DeviceInfo) => `${info.batteryLevel}%`
  },
  {
    key: 'lastConnected',
    header: 'Last Connected',
    render: (info: DeviceInfo) => new Date(info.lastConnected).toLocaleString()
  },
  {
    key: 'settings',
    header: 'Settings',
    render: (info: DeviceInfo) => (
      <div className="flex flex-col gap-1">
        <span className="text-sm">Screen Time: {info.settings.screenTimeLimit} mins</span>
        <span className="text-sm">Geofence: {info.settings.geofenceRadius}m</span>
        <span className="text-sm">Allowed Apps: {info.settings.allowedApps.length}</span>
        <span className="text-sm">Blocked Sites: {info.settings.blockedWebsites.length}</span>
      </div>
    )
  },
  {
    key: 'installedApps',
    header: 'Installed Apps',
    render: (info: DeviceInfo) => (
      <div className="flex flex-col gap-1">
        {info.installedApps.map((app) => (
          <div key={app._id} className="flex items-center gap-2">
            <span className="text-sm">{app.appName}</span>
            {app.isRestricted && (
              <span className="px-1 py-0.5 rounded text-xs bg-yellow-100 text-yellow-800">
                Restricted
              </span>
            )}
          </div>
        ))}
      </div>
    )
  }
];

export default function DeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { selectedDevice, setSelectedDevice, loading: deviceLoading, error: deviceError } = useDevice();

  useEffect(() => {
    if (!selectedDevice) {
      setLoading(false);
      return;
    }

    const fetchDeviceInfo = async () => {
      try {
        setLoading(true);
        const { data, error } = await fetchWithAuth<DeviceInfo[]>(`devices/${selectedDevice}`);
        
        if (error) {
          setError(error);
          return;
        }
        setDeviceInfo([data] || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceInfo();
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
                    <BreadcrumbPage>Device Info</BreadcrumbPage>
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

            {(loading || deviceLoading) && <div>Loading device info...</div>}
            {(error || deviceError) && <div className="text-red-500">Error: {error || deviceError}</div>}
            
            {!selectedDevice && !loading && !deviceLoading && (
              <div className="text-center text-muted-foreground">
                Please select a device to view device info
              </div>
            )}
            
            {selectedDevice && !loading && !deviceLoading && !error && !deviceError && (
              <DataTable
                data={deviceInfo}
                columns={deviceInfoColumns}
                emptyMessage="No device info found"
              />
            )}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
} 