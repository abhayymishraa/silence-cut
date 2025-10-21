"use client";

import { signIn, useSession, getProviders } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { useWorkspace } from "~/contexts/WorkspaceContext";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [providers, setProviders] = useState<Record<string, { id: string; name: string; type: string }> | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { workspace } = useWorkspace();

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  // Load available providers and check for success message
  useEffect(() => {
    const loadProviders = async () => {
      try {
        const res = await fetch("/api/auth/providers");
        const data = await res.json();
        setProviders(data);
      } catch (e) {
        // Ignore; will fallback to null
      }
    };
    loadProviders();
    
    // Check for success message from signup
    const message = searchParams.get("message");
    if (message) {
      setSuccessMessage(message);
    }
  }, [searchParams]);


  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      // Use demo provider for authentication
      const result = await signIn("demo", {
        email,
        password,
        redirect: false,
      });
      
      if (result?.ok) {
        router.push("/dashboard");
      } else {
        setError("Invalid credentials. Please try again.");
        setIsLoading(false);
      }
    } catch (error) {
      setError("Something went wrong");
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if already authenticated (will redirect)
  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            {workspace?.logoUrl ? (
              <div className="h-12 w-12 rounded-lg overflow-hidden flex items-center justify-center">
                <img 
                  src={workspace.logoUrl} 
                  alt={`${workspace.name} Logo`}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <div 
                className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: workspace?.primaryColor || '#3b82f6' }}
              >
                {workspace?.name?.charAt(0) || 'VP'}
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your {workspace?.name || 'Video Processor'} account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {successMessage && (
            <p className="text-green-500 text-sm text-center">{successMessage}</p>
          )}
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          {providers?.demo ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="text-sm text-red-500 text-center">
                  {error}
                </div>
              )}
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full"
                style={{ backgroundColor: workspace?.primaryColor || '#3b82f6' }}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          ) : (
            <div className="space-y-3">
              {providers && Object.values(providers).length > 0 ? (
                Object.values(providers).map((p) => (
                  <Button
                    key={p.id}
                    className="w-full"
                    onClick={() => signIn(p.id)}
                  >
                    Continue with {p.name}
                  </Button>
                ))
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Authentication is not configured. Please restart the development server with the correct environment variables.
                  </p>
                  <div className="bg-muted p-4 rounded-lg text-left text-xs font-mono">
                    <p className="font-semibold mb-2">To fix this, run:</p>
                    <p>export DATABASE_URL="postgresql://postgres@localhost:5432/video_processor"</p>
                    <p>export ENABLE_DEMO_LOGIN=true</p>
                    <p>export DEMO_PASSWORD=demo123</p>
                    <p>npm run dev</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">Don't have an account?</p>
            <Link href="/signup" className="text-primary hover:underline">
              Create an account
            </Link>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
