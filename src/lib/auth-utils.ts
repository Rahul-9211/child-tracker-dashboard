interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  allowedDevices: string[];
  createdAt: string;
  updatedAt: string;
}

export const auth = {
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    return !!token && !!user;
  },

  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    
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
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}; 