"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GalleryVerticalEnd } from "lucide-react"
import Image from "next/image"

import { LoginForm } from "@/components/ui/login-form"
import { auth } from '@/lib/auth-utils'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    if (auth.isAuthenticated()) {
      const user = auth.getUser()
      if (user?.role === 'admin') {
        router.push('/dashboard')
      } else {
        router.push('/dashboard')
      }
    }
  }, [router])

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Acme Inc.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
        <Image 
          src="/logo.png" 
          alt="Logo"
          width={150}
          height={150}
          className="mb-8"
        />
      </div>
      <div className="relative hidden bg-muted lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
      </div>
    </div>
  )
}
