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
}

export default function Processes() {
  const [processes, setProcesses] = useState<ProcessActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          auth.logout();
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/process-activities/device/${localStorage.getItem('deviceId')}/active`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            auth.logout();
            return;
          }
          throw new Error('Failed to fetch processes');
        }
        
        const data = await response.json();
        setProcesses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        if (err instanceof Error && err.message.includes('unauthorized')) {
          auth.logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProcesses();
  }, [router]);

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
                    <BreadcrumbPage>Processes</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <main className="p-6">
            {loading && <div>Loading processes...</div>}
            {error && <div className="text-red-500">Error: {error}</div>}
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Process Name</TableHead>
                    <TableHead>Package Name</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>CPU Usage</TableHead>
                    <TableHead>Memory Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Process ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processes.map((process) => (
                    <TableRow key={process._id}>
                      <TableCell className="font-medium">{process.processName}</TableCell>
                      <TableCell>{process.packageName}</TableCell>
                      <TableCell>{new Date(process.startTime).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={process.cpuUsage > 50 ? "destructive" : "default"}>
                          {process.cpuUsage.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={process.memoryUsage > 500 ? "destructive" : "default"}>
                          {process.memoryUsage} MB
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={process.isActive ? "default" : "secondary"}>
                          {process.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {process.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{process.processId}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
} 