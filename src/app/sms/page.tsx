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

interface SMS {
  _id: string;
  deviceId: string;
  type: string;
  address: string;
  body: string;
  timestamp: string;
  read: boolean;
  threadId: string;
  contactName: string;
  serviceCenter: string;
}

export default function SMS() {
  const [smsList, setSMSList] = useState<SMS[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSMS = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          auth.logout();
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sms/device/${localStorage.getItem('deviceId')}/history`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            auth.logout();
            return;
          }
          throw new Error('Failed to fetch SMS history');
        }
        
        const data = await response.json();
        setSMSList(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        if (err instanceof Error && err.message.includes('unauthorized')) {
          auth.logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSMS();
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
                    <BreadcrumbPage>SMS</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <main className="p-6">
            {loading && <div>Loading SMS history...</div>}
            {error && <div className="text-red-500">Error: {error}</div>}
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Thread ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {smsList.map((sms) => (
                    <TableRow key={sms._id}>
                      <TableCell>
                        <Badge 
                          variant={sms.type === 'received' ? 'default' : 'secondary'}
                        >
                          {sms.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{sms.contactName || 'Unknown'}</TableCell>
                      <TableCell>{sms.address}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{sms.body}</TableCell>
                      <TableCell>{new Date(sms.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={sms.read ? "secondary" : "default"}>
                          {sms.read ? "Read" : "Unread"}
                        </Badge>
                      </TableCell>
                      <TableCell>{sms.threadId}</TableCell>
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