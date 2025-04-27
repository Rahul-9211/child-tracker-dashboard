"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiService } from "@/lib/api-service";
import { toast } from "sonner";
import { GalleryVerticalEnd, CheckCircle } from "lucide-react";
import Image from "next/image";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiService.forgotPassword(email);
      toast.success(response.message || "Password reset email sent");
      setIsSuccess(true);
      // Don't redirect immediately, show success state
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send reset link";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
            {isSuccess ? (
              <div className="flex flex-col gap-6 items-center text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h1 className="text-2xl font-bold">Check Your Email</h1>
                  <p className="text-balance text-sm text-muted-foreground">
                    We{"'"}ve sent a password reset link to <span className="font-medium">{email}</span>. 
                    Please check your inbox and follow the instructions to reset your password.
                  </p>
                </div>
                <div className="space-y-4 w-full">
                  <Button
                    onClick={() => router.push("/login")}
                    className="w-full"
                  >
                    Back to Login
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsSuccess(false);
                      setEmail("");
                    }}
                    className="w-full"
                  >
                    Try a Different Email
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Forgot Password</h1>
                  <p className="text-balance text-sm text-muted-foreground">
                    Enter your email below to reset your password
                  </p>
                  {error && (
                    <p className="text-sm text-red-500 bg-red-50 p-2 rounded-md w-full">
                      {error}
                    </p>
                  )}
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                  <div className="text-center text-sm">
                    Remember your password?{" "}
                    <a href="/login" className="underline underline-offset-4">
                      Back to login
                    </a>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 