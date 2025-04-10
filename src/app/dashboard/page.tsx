"use client"

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/ui/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DeviceSelector } from "@/components/shared/device-selector"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchWithAuth } from "@/lib/api-utils"
import { useDevice } from "@/hooks/use-device"

interface DashboardStats {
  totalContacts: number;
  totalCalls: number;
  totalSMS: number;
  totalLocations: number;
  totalApplications: number;
  totalProcesses: number;
  totalNotifications: number;
  lastUpdated: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { selectedDevice, setSelectedDevice, loading: deviceLoading, error: deviceError } = useDevice();

  useEffect(() => {
    if (!selectedDevice) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data, error } = await fetchWithAuth<DashboardStats>(`dashboard/stats/${selectedDevice}`);
        
        if (error) {
          setError(error);
          return;
        }

        setStats(data || null);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
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

            {(loading || deviceLoading) && <div>Loading dashboard stats...</div>}
            {(error || deviceError) && <div className="text-red-500">Error: {error || deviceError}</div>}
            
            {!selectedDevice && !loading && !deviceLoading && (
              <div className="text-center text-muted-foreground">
                Please select a device to view dashboard stats
              </div>
            )}
            
            {stats && !loading && !deviceLoading && !error && !deviceError && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Contacts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalContacts}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Calls</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalCalls}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>SMS</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalSMS}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Locations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalLocations}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalApplications}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Processes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalProcesses}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalNotifications}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Last Updated</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {new Date(stats.lastUpdated).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
