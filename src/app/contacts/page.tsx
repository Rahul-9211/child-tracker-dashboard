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

interface Contact {
  _id: string;
  deviceId: string;
  name: string;
  phoneNumbers: string[];
  emailAddresses: string[];
  contactId: string;
  lastUpdated: string;
  isDeleted: boolean;
  isFavorite: boolean;
  hasPhoto: boolean;
  photoUri: string;
  notes: string;
  groups: string[];
  createdAt: string;
  updatedAt: string;
}

interface Device {
  _id: string;
  deviceId: string;
  deviceName: string;
}

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
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

  useEffect(() => {
    if (!selectedDevice) return;

    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          auth.logout();
          return;
        }

        setLoading(true);
        const response = await fetch(`https://child-tracker-server.onrender.com/api/contacts/device/${selectedDevice}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            auth.logout();
            return;
          }
          throw new Error('Failed to fetch contacts');
        }
        
        const data = await response.json();
        setContacts(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
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
                    <BreadcrumbPage>Contacts</BreadcrumbPage>
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

            {loading && <div>Loading contacts...</div>}
            {error && <div className="text-red-500">Error: {error}</div>}
            
            {!selectedDevice && !loading && (
              <div className="text-center text-muted-foreground">
                Please select a device to view contacts
              </div>
            )}
            
            {selectedDevice && !loading && !error && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone Numbers</TableHead>
                      <TableHead>Email Addresses</TableHead>
                      <TableHead>Groups</TableHead>
                      <TableHead>Favorite</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact) => (
                      <TableRow key={contact._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {contact.hasPhoto && (
                              <img 
                                src={contact.photoUri} 
                                alt={contact.name}
                                className="h-8 w-8 rounded-full"
                              />
                            )}
                            {contact.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {contact.phoneNumbers.map((phone, index) => (
                              <div key={index} className="text-sm">{phone}</div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {contact.emailAddresses.map((email, index) => (
                              <div key={index} className="text-sm">{email}</div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {contact.groups.map((group, index) => (
                              <Badge key={index} variant="secondary">
                                {group}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={contact.isFavorite ? "default" : "secondary"}>
                            {contact.isFavorite ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(contact.lastUpdated).toLocaleString()}</TableCell>
                        <TableCell>{contact.notes}</TableCell>
                        <TableCell>
                          <Badge variant={contact.isDeleted ? "destructive" : "default"}>
                            {contact.isDeleted ? "Deleted" : "Active"}
                          </Badge>
                        </TableCell>
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