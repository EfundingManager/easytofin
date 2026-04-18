import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SignUp() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"form" | "verification" | "success">("form");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    phone?: string;
    fullName?: string;
  }>({});

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate phone format (basic international format)
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  // Validate full name
  const validateFullName = (name: string): boolean => {
    return name.trim().length >= 2 && name.trim().split(" ").length >= 2;
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (!validateFullName(fullName)) {
      newErrors.fullName = "Please enter your first and last name";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    try {
      // Here you would call your backend API to create the user
      // For now, we'll simulate the process
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setStep("verification");
      toast.success("Account created successfully!");

      // Simulate verification completion
      setTimeout(() => {
        setStep("success");
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="border border-[oklch(0.92_0.02_155)] shadow-lg">
            <CardHeader className="space-y-2 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-[oklch(0.25_0.06_155)]">
                    Create Your Account
                  </CardTitle>
                  <CardDescription className="text-[oklch(0.52_0.015_155)] mt-1">
                    Join EasyToFin to manage your finances
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="max-h-[calc(100vh-200px)] overflow-y-auto scroll-smooth pr-2">
              {step === "form" && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name Field */}
                  <div>
                    <label className="text-sm font-medium text-[oklch(0.25_0.06_155)] block mb-2">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) {
                          setErrors({ ...errors, fullName: "" });
                        }
                      }}
                      disabled={loading}
                      className={`border-[oklch(0.88_0.008_240)] ${
                        errors.fullName ? "border-red-500" : ""
                      }`}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="text-sm font-medium text-[oklch(0.25_0.06_155)] block mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) {
                          setErrors({ ...errors, email: "" });
                        }
                      }}
                      disabled={loading}
                      className={`border-[oklch(0.88_0.008_240)] ${
                        errors.email ? "border-red-500" : ""
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone Number Field */}
                  <div>
                    <label className="text-sm font-medium text-[oklch(0.25_0.06_155)] block mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      placeholder="+353 87 123 4567"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) {
                          setErrors({ ...errors, phone: "" });
                        }
                      }}
                      disabled={loading}
                      className={`border-[oklch(0.88_0.008_240)] ${
                        errors.phone ? "border-red-500" : ""
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white mt-6"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>

                  {/* Login Link */}
                  <div className="text-center text-sm text-[oklch(0.52_0.015_240)] mt-4">
                    Already have an account?{" "}
                    <Link href="/auth-selection" className="text-blue-600 hover:text-blue-700 font-medium">
                      Sign in here
                    </Link>
                  </div>
                </form>
              )}

              {step === "verification" && (
                <div className="space-y-4 text-center">
                  <div className="flex justify-center">
                    <Loader2 className="w-12 h-12 text-[oklch(0.40_0.11_195)] animate-spin" />
                  </div>
                  <h3 className="text-lg font-semibold text-[oklch(0.25_0.06_155)]">
                    Verifying Your Information
                  </h3>
                  <p className="text-sm text-[oklch(0.52_0.015_240)]">
                    Please wait while we set up your account...
                  </p>
                </div>
              )}

              {step === "success" && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <div className="mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-green-900 mb-2">
                        Account Created Successfully!
                      </h3>
                      <p className="text-sm text-green-700 mb-4">
                        Welcome to EasyToFin, <span className="font-semibold">{fullName}</span>!
                      </p>
                    </div>

                    <div className="bg-white rounded p-4 mb-4 text-left space-y-2">
                      <div className="text-sm">
                        <span className="text-[oklch(0.52_0.015_240)]">Email: </span>
                        <span className="font-semibold text-[oklch(0.25_0.06_155)]">{email}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-[oklch(0.52_0.015_240)]">Phone: </span>
                        <span className="font-semibold text-[oklch(0.25_0.06_155)]">{phone}</span>
                      </div>
                    </div>

                    <p className="text-sm text-green-700 mb-6">
                      <strong>Next step:</strong> Complete your profile and verify your email
                    </p>

                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => setLocation("/admin")}
                    >
                      Go to Dashboard
                    </Button>

                    <button
                      type="button"
                      onClick={() => setLocation("/auth-selection")}
                      className="w-full text-sm text-slate-600 hover:text-slate-900 font-medium py-2 mt-2"
                    >
                      Back to Login
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-[oklch(0.52_0.015_240)]">
            By signing up, you agree to our{" "}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
              Privacy Policy
            </Link>
            {" "}and{" "}
            <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
