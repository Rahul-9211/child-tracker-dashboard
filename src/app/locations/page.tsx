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

interface Location {
  _id: string;
  deviceId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number;
  speed: number;
  bearing: number;
  address: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

const locationsColumns = [
  {
    key: 'address',
    header: 'Address',
    render: (location: Location) => location.address
  },
  {
    key: 'coordinates',
    header: 'Coordinates',
    render: (location: Location) => (
      <div className="flex flex-col">
        <span>Lat: {location.latitude}</span>
        <span>Lng: {location.longitude}</span>
      </div>
    )
  },
  {
    key: 'accuracy',
    header: 'Accuracy',
    render: (location: Location) => `${location.accuracy}m`
  },
  {
    key: 'altitude',
    header: 'Altitude',
    render: (location: Location) => `${location.altitude}m`
  },
  {
    key: 'speed',
    header: 'Speed',
    render: (location: Location) => `${location.speed}m/s`
  },
  {
    key: 'bearing',
    header: 'Bearing',
    render: (location: Location) => `${location.bearing}°`
  },
  {
    key: 'timestamp',
    header: 'Time',
    render: (location: Location) => new Date(location.timestamp).toLocaleString()
  }
];

export default function Locations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { selectedDevice, setSelectedDevice, loading: deviceLoading, error: deviceError } = useDevice();

  useEffect(() => {
    if (!selectedDevice) {
      setLoading(false);
      return;
    }

    const fetchLocations = async () => {
      try {
        setLoading(true);
        const { data, error } = await fetchWithAuth<Location[]>(`locations/device/${selectedDevice}`);
        
        if (error) {
          setError(error);
          return;
        }

        setLocations(data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
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
                    <BreadcrumbPage>Locations</BreadcrumbPage>
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

            {(loading || deviceLoading) && <div>Loading locations...</div>}
            {(error || deviceError) && <div className="text-red-500">Error: {error || deviceError}</div>}
            
            {!selectedDevice && !loading && !deviceLoading && (
              <div className="text-center text-muted-foreground">
                Please select a device to view locations
              </div>
            )}
            
            {selectedDevice && !loading && !deviceLoading && !error && !deviceError && (
              <DataTable
                data={locations}
                columns={locationsColumns}
                emptyMessage="No locations found"
              />
            )}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
} 