import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, Eye, EyeOff, Check, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SignUp() {
  const [, setLocation] = useLocation();
  const signupMutation = trpc.signup.registerUser.useMutation();
  const [step, setStep] = useState<"form" | "password" | "verification" | "success">("form");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    phone?: string;
    fullName?: string;
    password?: string;
    confirmPassword?: string;
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

  // Check password strength
  const checkPasswordStrength = (pwd: string): {
    score: number;
    feedback: string[];
    isStrong: boolean;
  } => {
    const feedback: string[] = [];
    let score = 0;

    if (pwd.length >= 8) {
      score++;
    } else {
      feedback.push("At least 8 characters");
    }

    if (/[a-z]/.test(pwd)) {
      score++;
    } else {
      feedback.push("Lowercase letter");
    }

    if (/[A-Z]/.test(pwd)) {
      score++;
    } else {
      feedback.push("Uppercase letter");
    }

    if (/[0-9]/.test(pwd)) {
      score++;
    } else {
      feedback.push("Number");
    }

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
      score++;
    } else {
      feedback.push("Special character");
    }

    return {
      score,
      feedback,
      isStrong: score >= 4,
    };
  };

  // Validate form step 1
  const validateFormStep1 = (): boolean => {
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

  // Validate password step
  const validatePasswordStep = (): boolean => {
    const newErrors: typeof errors = {};
    const strength = checkPasswordStrength(password);

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (!strength.isStrong) {
      newErrors.password = "Password is not strong enough";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form step 1 submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFormStep1()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setStep("password");
  };

  // Handle password step submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordStep()) {
      toast.error("Please fix the password errors");
      return;
    }

    setLoading(true);
    try {
      // Call backend to register user with password
      const result = await signupMutation.mutateAsync({
        email: email.toLowerCase(),
        phone,
        fullName,
        password,
      });

      if (result.success) {
        setStep("verification");
        toast.success("Account created! Please verify your email.");

        // Redirect to email verification page after 2 seconds
        setTimeout(() => {
          setLocation("/verify-email-pending");
        }, 2000);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = checkPasswordStrength(password);
  const strengthColor =
    passwordStrength.score < 2
      ? "text-red-600"
      : passwordStrength.score < 4
        ? "text-yellow-600"
        : "text-green-600";

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
                    {step === "form" && "Step 1: Your Information"}
                    {step === "password" && "Step 2: Create Your Password"}
                    {step === "verification" && "Verifying Your Information"}
                    {step === "success" && "Account Created Successfully"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="max-h-[calc(100vh-200px)] overflow-y-auto scroll-smooth pr-2">
              {/* Step 1: Form */}
              {step === "form" && (
                <form onSubmit={handleFormSubmit} className="space-y-4">
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
                        Processing...
                      </>
                    ) : (
                      "Continue to Password Setup"
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

              {/* Step 2: Password Setup */}
              {step === "password" && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  {/* Password Field */}
                  <div>
                    <label className="text-sm font-medium text-[oklch(0.25_0.06_155)] block mb-2">
                      Create Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter a strong password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) {
                            setErrors({ ...errors, password: "" });
                          }
                        }}
                        disabled={loading}
                        className={`border-[oklch(0.88_0.008_240)] pr-10 ${
                          errors.password ? "border-red-500" : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[oklch(0.52_0.015_240)]"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="mt-3 space-y-2">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full ${
                                i < passwordStrength.score
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <p className={`text-xs font-medium ${strengthColor}`}>
                          {passwordStrength.score < 2
                            ? "Weak password"
                            : passwordStrength.score < 4
                              ? "Medium strength"
                              : "Strong password"}
                        </p>

                        {passwordStrength.feedback.length > 0 && (
                          <div className="text-xs text-[oklch(0.52_0.015_240)] space-y-1">
                            <p className="font-medium">Add to strengthen:</p>
                            {passwordStrength.feedback.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-1">
                                <X size={12} className="text-red-500" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {passwordStrength.isStrong && (
                          <div className="text-xs text-green-600 flex items-center gap-1">
                            <Check size={12} />
                            <span>Password meets all requirements</span>
                          </div>
                        )}
                      </div>
                    )}

                    {errors.password && (
                      <p className="text-xs text-red-600 mt-1">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label className="text-sm font-medium text-[oklch(0.25_0.06_155)] block mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errors.confirmPassword) {
                            setErrors({ ...errors, confirmPassword: "" });
                          }
                        }}
                        disabled={loading}
                        className={`border-[oklch(0.88_0.008_240)] pr-10 ${
                          errors.confirmPassword ? "border-red-500" : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[oklch(0.52_0.015_240)]"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {confirmPassword && password === confirmPassword && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <Check size={12} />
                        Passwords match
                      </p>
                    )}

                    {errors.confirmPassword && (
                      <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Button Group */}
                  <div className="flex gap-3 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setStep("form");
                        setErrors({});
                      }}
                      disabled={loading}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white"
                      disabled={loading || !passwordStrength.isStrong}
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
                  </div>
                </form>
              )}

              {/* Step 3: Verification */}
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

              {/* Step 4: Success */}
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
