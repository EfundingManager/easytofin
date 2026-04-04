import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "wouter";

export default function AuthSelection() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow bg-gradient-to-br from-[oklch(0.97_0.003_240)] to-[oklch(0.92_0.02_155)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center text-[oklch(0.40_0.11_195)] hover:text-[oklch(0.35_0.10_195)] mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <Card className="border-[oklch(0.88_0.008_240)]">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-[Outfit] font-800 text-[oklch(0.18_0.015_240)]">
                Choose Registration Method
              </CardTitle>
              <CardDescription className="text-[oklch(0.52_0.015_240)]">
                Select how you'd like to sign in or register
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Phone Registration */}
              <Button
                onClick={() => setLocation("/phone-auth")}
                className="w-full h-auto py-6 px-4 bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white flex flex-col items-center gap-3"
              >
                <Phone className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-semibold">Sign in with Phone</div>
                  <div className="text-xs opacity-90">Receive OTP via SMS</div>
                </div>
              </Button>

              {/* Email Registration */}
              <Button
                onClick={() => setLocation("/email-auth")}
                className="w-full h-auto py-6 px-4 bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white flex flex-col items-center gap-3"
              >
                <Mail className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-semibold">Sign in with Email</div>
                  <div className="text-xs opacity-90">Receive OTP via email</div>
                </div>
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[oklch(0.88_0.008_240)]" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-[oklch(0.52_0.015_240)]">or</span>
                </div>
              </div>

              {/* Terms */}
              <p className="text-xs text-center text-[oklch(0.52_0.015_240)]">
                By signing in, you agree to our{" "}
                <a href="#" className="text-[oklch(0.40_0.11_195)] hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-[oklch(0.40_0.11_195)] hover:underline">
                  Privacy Policy
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
