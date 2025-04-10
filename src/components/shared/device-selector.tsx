import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDevice } from "@/hooks/use-device";

interface DeviceSelectorProps {
  onDeviceChange: (deviceId: string) => void;
  selectedDevice: string;
}

export function DeviceSelector({ onDeviceChange, selectedDevice }: DeviceSelectorProps) {
  const { devices, error } = useDevice();

  return (
    <div className="mb-4">
      <Select value={selectedDevice} onValueChange={onDeviceChange}>
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
      {error && <div className="text-red-500 mt-2">Error: {error}</div>}
    </div>
  );
} 