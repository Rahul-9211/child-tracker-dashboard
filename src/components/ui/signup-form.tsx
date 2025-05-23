"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiService } from "@/lib/api-service"
import { Toaster } from "sonner"
import { toast } from "sonner"

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  deviceId?: string;
  general?: string;
}

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})

  const validateForm = (name: string, email: string, password: string, deviceId: string): boolean => {
    const newErrors: ValidationErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!deviceId.trim()) {
      newErrors.deviceId = "Device ID is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const deviceId = formData.get("deviceId") as string

    // Validate form before making API call
    if (!validateForm(name, email, password, deviceId)) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiService.signup({ 
        name, 
        email, 
        password, 
        role: "user", 
        deviceId 
      })
      
      // Store user data and token
      localStorage.setItem("token", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))
      
      toast.success("Account created successfully!")
      
      // Redirect to dashboard
      router.push("/dashboard")
    } catch (err) {
      // Handle different types of errors
      if (err instanceof Error) {
        if (err.message.includes("Network") || err.message.includes("Failed to fetch")) {
          setErrors({
            general: "Unable to connect to the server. Please check your internet connection."
          });
        } else if (err.message.includes("already exists") || err.message.includes("Email")) {
          setErrors({
            email: "This email is already registered. Please use a different email or login."
          });
        } else {
          setErrors({
            general: err.message || "An unexpected error occurred. Please try again."
          });
        }
      } else {
        setErrors({
          general: "An unexpected error occurred. Please try again."
        });
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <Toaster position="top-center" />
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your details below to create a new account
        </p>
        {errors.general && (
          <p className="text-sm text-red-500 bg-red-50 p-2 rounded-md w-full">
            {errors.general}
          </p>
        )}
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Full Name</Label>
          <Input 
            name="name" 
            id="name" 
            type="text" 
            placeholder="John Doe" 
            required 
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name}</p>
          )}
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            name="email" 
            id="email" 
            type="email" 
            placeholder="m@example.com" 
            required 
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email}</p>
          )}
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            name="password" 
            id="password" 
            type="password" 
            required 
            className={errors.password ? "border-red-500" : ""}
          />
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password}</p>
          )}
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="deviceId">Device ID</Label>
          <Input 
            name="deviceId" 
            id="deviceId" 
            type="text" 
            placeholder="device123"
            required 
            className={errors.deviceId ? "border-red-500" : ""}
          />
          {errors.deviceId && (
            <p className="text-xs text-red-500">{errors.deviceId}</p>
          )}
        </div>
        
        <Button 
          type="submit" 
          className="w-full mt-2" 
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating account...
            </span>
          ) : (
            "Sign up"
          )}
        </Button>
      </div>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <a href="/login" className="underline underline-offset-4">
          Log in
        </a>
      </div>
    </form>
  )
} 