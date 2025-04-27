"use client";

import { useEffect } from "react";
import { auth } from "@/lib/auth-utils";

export default function Home() {
  useEffect(() => {
    // Use direct location.replace to avoid Next.js router history 
    // which seems to be causing issues with the dashboard
    if (typeof window !== 'undefined') {
      if (auth.isAuthenticated()) {
        const user = auth.getUser();
        if (user?.role === 'admin') {
          window.location.replace('/admin/dashboard');
        } else {
          window.location.replace('/dashboard');
        }
      } else {
        window.location.replace('/login');
      }
    }
  }, []);

  // Show nothing while redirecting
  return null;
}
