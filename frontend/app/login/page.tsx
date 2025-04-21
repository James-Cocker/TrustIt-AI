"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth"; // Assuming useAuth handles signup as well or you have a separate hook/page
import { useLegalModal } from "@/components/context/LegalModalContext"; // Import the custom hook

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { signIn } = useAuth(); // Make sure useAuth or similar handles signup logic if this component is reused/adapted
  const { openTermsModal, openPrivacyModal } = useLegalModal(); // Use the context

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(email, password);
      toast({
        title: "Login successful",
        description: "You have been signed in",
      });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Determine if this is a signup or login page based on props or route if needed
  // For simplicity, the message uses "continuing", applicable to both.
  // Adjust wording if this component is strictly for login.
  const actionText = "Sign in"; // Or dynamically set based on page type (login/signup)
  const agreementText = `By ${actionText.toLowerCase().replace('sign ', 'signing ')}, you agree to our`; // Adjust phrasing as needed

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{actionText}</CardTitle>
          <CardDescription>Enter your email and password to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-label="Password"
              />
            </div>
            <div className="text-right">
              <Link href="/reset-password" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : actionText}
            </Button>

            {/* Agreement Text with Buttons to Open Modals */}
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 px-4">
              {agreementText}{" "}
              <button
                type="button"
                onClick={openTermsModal}
                className="underline hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
              >
                Terms and Conditions
              </button>{" "}
              and{" "}
              <button
                type="button"
                onClick={openPrivacyModal}
                className="underline hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
              >
                Privacy Policy
              </button>.
            </p>

            {/* Link to Sign Up */}
            <div className="text-center text-sm text-gray-600 dark:text-gray-300">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}