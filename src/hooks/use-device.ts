import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api-utils';

interface Device {
  _id: string;
  deviceId: string;
  deviceName: string;
}

interface UseDeviceReturn {
  devices: Device[];
  selectedDevice: string;
  setSelectedDevice: (deviceId: string) => void;
  loading: boolean;
  error: string | null;
}

export function useDevice(): UseDeviceReturn {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        const { data, error } = await fetchWithAuth<Device[]>('devices');
        
        if (error) {
          setError(error);
          return;
        }

        setDevices(data || []);
        
        // Handle device selection
        const storedDeviceId = localStorage.getItem('deviceId');
        if (storedDeviceId) {
          setSelectedDevice(storedDeviceId);
        } else if (data?.length > 0) {
          setSelectedDevice(data[0]?.deviceId || '');
          localStorage.setItem('deviceId', data[0]?.deviceId || '');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDevice(deviceId);
    localStorage.setItem('deviceId', deviceId);
  };

  return {
    devices,
    selectedDevice,
    setSelectedDevice: handleDeviceChange,
    loading,
    error
  };
} 