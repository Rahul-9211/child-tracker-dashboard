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
import Image from "next/image";

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

const contactsColumns = [
  {
    key: 'name',
    header: 'Name',
    render: (contact: Contact) => (
      <div className="flex items-center gap-2">
        {contact.hasPhoto ? (
          contact.photoUri.startsWith('content://') ? (
            <img 
              src={contact.photoUri} 
              alt={contact.name}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <Image
              src={contact.photoUri}
              alt={contact.name}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full"
            />
          )
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <span className="text-xs font-medium">
              {contact.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span className="font-medium">{contact.name}</span>
      </div>
    )
  },
  {
    key: 'phoneNumbers',
    header: 'Phone Numbers',
    render: (contact: Contact) => (
      <div className="flex flex-col">
        {contact.phoneNumbers.map((phone, index) => (
          <span key={index}>{phone}</span>
        ))}
      </div>
    )
  },
  {
    key: 'emailAddresses',
    header: 'Email Addresses',
    render: (contact: Contact) => (
      <div className="flex flex-col">
        {contact.emailAddresses.map((email, index) => (
          <span key={index}>{email}</span>
        ))}
      </div>
    )
  },
  {
    key: 'groups',
    header: 'Groups',
    render: (contact: Contact) => (
      <div className="flex flex-wrap gap-1">
        {contact.groups.map((group, index) => (
          <span key={index} className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
            {group}
          </span>
        ))}
      </div>
    )
  },
  {
    key: 'notes',
    header: 'Notes',
    render: (contact: Contact) => contact.notes
  },
  {
    key: 'status',
    header: 'Status',
    render: (contact: Contact) => (
      <div className="flex flex-col gap-1">
        {contact.isFavorite && (
          <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
            Favorite
          </span>
        )}
        {contact.isDeleted && (
          <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
            Deleted
          </span>
        )}
      </div>
    )
  },
  {
    key: 'lastUpdated',
    header: 'Last Updated',
    render: (contact: Contact) => new Date(contact.lastUpdated).toLocaleString()
  }
];

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { selectedDevice, setSelectedDevice, loading: deviceLoading, error: deviceError } = useDevice();

  useEffect(() => {
    if (!selectedDevice) {
      setLoading(false);
      return;
    }

    const fetchContacts = async () => {
      try {
        setLoading(true);
        const { data, error } = await fetchWithAuth<Contact[]>(`contacts/device/${selectedDevice}`);
        
        if (error) {
          setError(error);
          return;
        }

        setContacts(data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
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
                    <BreadcrumbPage>Contacts</BreadcrumbPage>
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

            {(loading || deviceLoading) && <div>Loading contacts...</div>}
            {(error || deviceError) && <div className="text-red-500">Error: {error || deviceError}</div>}
            
            {!selectedDevice && !loading && !deviceLoading && (
              <div className="text-center text-muted-foreground">
                Please select a device to view contacts
              </div>
            )}
            
            {selectedDevice && !loading && !deviceLoading && !error && !deviceError && (
              <DataTable
                data={contacts}
                columns={contactsColumns}
                emptyMessage="No contacts found"
              />
            )}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
} 