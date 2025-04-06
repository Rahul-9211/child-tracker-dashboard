"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth-utils";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (auth.isAuthenticated()) {
      const user = auth.getUser();
      if (user?.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  return null;
}
