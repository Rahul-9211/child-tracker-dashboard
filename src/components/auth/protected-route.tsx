"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/auth-utils'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function ProtectedRoute({ children, allowedRoles = [] }: ProtectedRouteProps) {
  const router = useRouter()

  useEffect(() => {
    // First check if user is authenticated
    if (!auth.isAuthenticated()) {
      router.push('/login')
      return
    }

    // Then check if user has required role (if roles are specified)
    if (allowedRoles.length > 0 && !auth.isAuthorized(allowedRoles)) {
      // Redirect to appropriate dashboard based on user's role
      const user = auth.getUser()
      if (user?.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
    }
  }, [router, allowedRoles])

  return <>{children}</>
} 