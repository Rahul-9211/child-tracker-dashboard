"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GalleryVerticalEnd } from "lucide-react"
import Image from "next/image"

import { SignupForm } from "@/components/ui/signup-form"
import { auth } from '@/lib/auth-utils'

export default function SignupPage() {
  const router = useRouter()

  useEffect(() => {
    if (auth.isAuthenticated()) {
      const user = auth.getUser()
      if (user?.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
    }
  }, [router])

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden lg:block bg-muted">
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/globe.svg"
            alt="Security"
            width={400}
            height={400}
            className="opacity-20"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
      </div>
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
            <SignupForm />
          </div>
        </div>
      </div>
    </div>
  )
} 