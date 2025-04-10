import { auth } from "./auth-utils";

interface ApiResponse<T> {
  data: T;
  error?: string;
}

export async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      auth.logout();
      return { data: {} as T, error: 'No authentication token found' };
    }

    const response = await fetch(`https://child-tracker-server.onrender.com/api/${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        auth.logout();
        return { data: {} as T, error: 'Unauthorized' };
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return { 
      data: {} as T, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatTimestamp(timestamp: string | undefined): string {
  return timestamp ? new Date(timestamp).toLocaleString() : 'Unknown';
}

export function getFallbackValue<T>(value: T | undefined, fallback: T): T {
  return value ?? fallback;
} 