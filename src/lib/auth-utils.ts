interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  allowedDevices: string[];
  createdAt: string;
  updatedAt: string;
  avatar?: string;
}

const isBrowser = typeof window !== 'undefined';

export const auth = {
  isAuthenticated(): boolean {
    if (!isBrowser) return false;
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    return !!token && !!user;
  },

  getUser(): User | null {
    if (!isBrowser) return null;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  isAuthorized(allowedRoles: string[]): boolean {
    const user = this.getUser();
    if (!user) return false;
    
    return allowedRoles.includes(user.role);
  },

  logout() {
    if (!isBrowser) return;
    
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear any other application data
    localStorage.clear(); // This will clear ALL localStorage data
    sessionStorage.clear(); // Clear any session storage data too
    
    // Clear any cookies (except those marked httpOnly)
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Redirect to login page
    window.location.href = '/login';
  }
}; 