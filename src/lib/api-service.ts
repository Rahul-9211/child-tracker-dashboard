const API_BASE_URL = 'https://child-tracker-server.onrender.com/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  allowedDevices: string[];
  createdAt: string;
  updatedAt: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

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
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Device {
  _id: string;
  deviceId: string;
  deviceName: string;
}

class ApiService {
  private async request<T>(endpoint: string): Promise<{ data: T; error?: string }> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Request failed');
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { data: [] as T, error: error instanceof Error ? error.message : 'An error occurred' };
    }
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Process Activities
  async getProcessActivities(deviceId: string): Promise<ProcessActivity[]> {
    const response = await this.request<ProcessActivity[]>(`/process-activities/device/${deviceId}/active`)
    if (response.error) {
      throw new Error(response.error)
    }
    return response.data
  }

  // Devices
  async getDevices(): Promise<Device[]> {
    const response = await this.request<Device[]>(`/devices`)
    if (response.error) {
      throw new Error(response.error)
    }
    return response.data
  }

  // Add other API methods here
}

export const apiService = new ApiService() 