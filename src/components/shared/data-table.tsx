import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDuration, formatTimestamp, getFallbackValue } from "@/lib/api-utils";

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
  }[];
  emptyMessage?: string;
}

export function DataTable<T>({ data, columns, emptyMessage = "No data available" }: DataTableProps<T>) {
  if (!data.length) {
    return <div className="text-center text-muted-foreground py-4">{emptyMessage}</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {column.render ? column.render(item) : getFallbackValue(item[column.key as keyof T], 'Unknown')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Example usage for calls table
export const callsTableColumns = [
  {
    key: 'contact',
    header: 'Contact',
    render: (record: any) => (
      <div className="flex flex-col">
        <span className="font-medium">
          {getFallbackValue(record?.metadata?.contactName, 'Unknown')}
        </span>
        <span className="text-xs text-muted-foreground">
          {record?.type === 'incoming' ? record?.caller : record?.receiver}
        </span>
      </div>
    ),
  },
  {
    key: 'type',
    header: 'Type',
    render: (record: any) => (
      <Badge variant={record?.type === 'incoming' ? 'default' : 'secondary'}>
        {getFallbackValue(record?.type, 'Unknown')}
      </Badge>
    ),
  },
  {
    key: 'duration',
    header: 'Duration',
    render: (record: any) => formatDuration(getFallbackValue(record?.duration, 0)),
  },
  {
    key: 'timestamp',
    header: 'Time',
    render: (record: any) => formatTimestamp(record?.timestamp),
  },
  {
    key: 'status',
    header: 'Status',
    render: (record: any) => (
      <Badge 
        variant={
          record?.status === 'completed' ? 'default' : 
          record?.status === 'missed' ? 'destructive' : 'secondary'
        }
      >
        {getFallbackValue(record?.status, 'Unknown')}
      </Badge>
    ),
  },
  {
    key: 'location',
    header: 'Location',
    render: (record: any) => (
      <div className="flex flex-col">
        <span>{getFallbackValue(record?.metadata?.location?.address, 'Unknown')}</span>
        <span className="text-xs text-muted-foreground">
          {record?.metadata?.location ? 
            `${record.metadata.location.latitude}, ${record.metadata.location.longitude}` : 
            'No location data'}
        </span>
      </div>
    ),
  },
  {
    key: 'category',
    header: 'Category',
    render: (record: any) => (
      <Badge variant="secondary">
        {getFallbackValue(record?.metadata?.category, 'Unknown')}
      </Badge>
    ),
  },
  {
    key: 'spam',
    header: 'Spam',
    render: (record: any) => (
      <Badge variant={record?.metadata?.isSpam ? 'destructive' : 'secondary'}>
        {record?.metadata?.isSpam ? 'Yes' : 'No'}
      </Badge>
    ),
  },
  {
    key: 'blocked',
    header: 'Blocked',
    render: (record: any) => (
      <Badge variant={record?.isBlocked ? 'destructive' : 'secondary'}>
        {record?.isBlocked ? 'Yes' : 'No'}
      </Badge>
    ),
  },
]; 