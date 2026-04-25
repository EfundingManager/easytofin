import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn, Plus, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "wouter";

interface PreviousUser {
  name?: string;
  email?: string;
  id?: string;
  role?: string;
}

export default function PostLogout() {
  const [, setLocation] = useLocation();
  const [previousUser, setPreviousUser] = useState<PreviousUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Retrieve previously logged-in user from localStorage
    const storedUserInfo = localStorage.getItem("manus-runtime-user-info");
    if (storedUserInfo) {
      try {
        const userInfo = JSON.parse(storedUserInfo);
        if (userInfo && userInfo.email) {
          setPreviousUser(userInfo);
        }
      } catch (error) {
        console.error("Failed to parse stored user info:", error);
      }
    }
  }, []);

  const handleQuickLogin = async () => {
    if (!previousUser?.email) return;

    setLoading(true);
    try {
      // Redirect to email auth with pre-filled email
      setLocation(`/email-auth?email=${encodeURIComponent(previousUser.email)}`);
    } catch (error) {
      console.error("Quick login error:", error);
      setLoading(false);
    }
  };

  const handleDifferentAccount = () => {
    setLocation("/auth-selection");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow bg-gradient-to-br from-[oklch(0.97_0.003_240)] to-[oklch(0.92_0.02_155)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-[oklch(0.88_0.008_240)]">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-[Outfit] font-800 text-[oklch(0.18_0.015_240)]">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-[oklch(0.52_0.015_240)]">
                You've been logged out. Choose how you'd like to proceed.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {previousUser && previousUser.email ? (
                <>
                  {/* Quick Login Option */}
                  <div className="p-4 bg-[oklch(0.96_0.003_240)] rounded-lg border border-[oklch(0.88_0.008_240)]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-[oklch(0.40_0.11_195)] flex items-center justify-center text-white font-semibold">
                      {(previousUser.name || previousUser.email).charAt(0).toUpperCase()}
                    </div>
                      <div className="flex-1 min-w-0">
                        {previousUser.name && (
                          <p className="font-semibold text-[oklch(0.18_0.015_240)] truncate">
                            {previousUser.name}
                          </p>
                        )}
                        <p className="text-sm text-[oklch(0.52_0.015_240)] truncate">
                          {previousUser.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleQuickLogin}
                      disabled={loading}
                      className="w-full bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      {loading ? "Logging in..." : "Log in as this user"}
                    </Button>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[oklch(0.88_0.008_240)]" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-[oklch(0.52_0.015_240)]">or</span>
                    </div>
                  </div>

                  {/* Different Account Option */}
                  <Button
                    onClick={handleDifferentAccount}
                    variant="outline"
                    className="w-full border-[oklch(0.88_0.008_240)] text-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.96_0.003_240)] flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Log in with a different account
                  </Button>
                </>
              ) : (
                <>
                  {/* No previous user - show auth selection */}
                  <p className="text-center text-[oklch(0.52_0.015_240)] mb-4">
                    Log in to your account to continue
                  </p>
                  <Button
                    onClick={handleDifferentAccount}
                    className="w-full bg-[oklch(0.40_0.11_195)] hover:bg-[oklch(0.35_0.10_195)] text-white"
                  >
                    Choose Login Method
                  </Button>
                </>
              )}

              {/* Back to Home Link */}
              <Link href="/" className="inline-flex items-center text-[oklch(0.40_0.11_195)] hover:text-[oklch(0.35_0.10_195)] text-sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
