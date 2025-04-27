"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { auth } from '@/lib/auth-utils'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function ProtectedRoute({ children, allowedRoles = [] }: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // First check if user is authenticated
    if (!auth.isAuthenticated()) {
      router.push('/login')
      return
    }

    // Then check if user has required role (if roles are specified)
    if (allowedRoles.length > 0 && !auth.isAuthorized(allowedRoles)) {
      // Only redirect if we're not already on the appropriate dashboard
      const user = auth.getUser()
      
      if (user?.role === 'admin' && pathname !== '/admin/dashboard') {
        router.push('/admin/dashboard')
      } else if (user?.role !== 'admin' && pathname === '/dashboard') {
        // Don't redirect from other pages (like /sms, /calls, etc.) to dashboard
        return
      } else if (user?.role !== 'admin' && pathname !== '/dashboard' && pathname === '/') {
        router.push('/dashboard')
      }
    }
  }, [router, allowedRoles, pathname])

  return <>{children}</>
} 