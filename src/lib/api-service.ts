const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

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

interface Application {
  _id: string;
  deviceId: string;
  packageName: string;
  appName: string;
  startTime: string;
  isActive: boolean;
  lastUsed: string;
  usageCount: number;
  category: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Notification {
  _id: string;
  deviceId: string;
  appPackageName: string;
  appName: string;
  title: string;
  text: string;
  timestamp: string;
  category: string;
  priority: string;
  isRead: boolean;
  isCleared: boolean;
  actions: string[];
  extras: {
    [key: string]: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface SMSMetadata {
  contactName: string;
  isSpam: boolean;
  category: string;
}

interface SMSRecord {
  metadata: SMSMetadata;
  _id: string;
  deviceId: string;
  messageId: string;
  sender: string;
  receiver: string;
  message: string;
  type: string;
  status: string;
  isBlocked: boolean;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface SMSPagination {
  total: number;
  page: number;
  pages: number;
}

interface SMSResponse {
  smsRecords: SMSRecord[];
  pagination: SMSPagination;
}

interface CallLocation {
  latitude: number;
  longitude: number;
  address: string;
}

interface CallMetadata {
  location: CallLocation;
  contactName: string;
  isSpam: boolean;
  category: string;
  recordingUrl: string;
}

interface CallRecord {
  metadata: CallMetadata;
  _id: string;
  deviceId: string;
  callId: string;
  caller: string;
  receiver: string;
  duration: number;
  type: string;
  status: string;
  isBlocked: boolean;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CallPagination {
  total: number;
  page: number;
  pages: number;
}

interface CallResponse {
  callRecords: CallRecord[];
  pagination: CallPagination;
}

class ApiService {
  private async request<T>(endpoint: string, options: { method?: string; body?: string } = {}): Promise<{ data: T; error?: string }> {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: options.method || 'GET',
        headers,
        body: options.body,
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
      return { data: null as T, error: error instanceof Error ? error.message : 'An error occurred' };
    }
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
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

  // Applications
  async getApplications(deviceId: string): Promise<Application[]> {
    const response = await this.request<Application[]>(`/applications/device/${deviceId}/active`)
    if (response.error) {
      throw new Error(response.error)
    }
    return response.data
  }

  // Notifications
  async getNotifications(deviceId: string): Promise<Notification[]> {
    const response = await this.request<Notification[]>(`/notifications/device/${deviceId}/unread`)
    if (response.error) {
      throw new Error(response.error)
    }
    return response.data
  }

  // SMS
  async getSMS(deviceId: string, page: number = 1): Promise<SMSResponse> {
    const response = await this.request<SMSResponse>(`/sms/device/${deviceId}?page=${page}`)
    if (response.error) {
      throw new Error(response.error)
    }
    return response.data
  }

  // Calls
  async getCalls(deviceId: string, page: number = 1): Promise<CallResponse> {
    const response = await this.request<CallResponse>(`/calls/device/${deviceId}?page=${page}`)
    if (response.error) {
      throw new Error(response.error)
    }
    return response.data
  }

  // Auth
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(`/auth/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({ 
        email,
        resetPasswordUrl: `${API_BASE_URL}/reset-password`
      }),
    });
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data;
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(`/auth/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data;
  }

  // Add other API methods here
}

export const apiService = new ApiService() 