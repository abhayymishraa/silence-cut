"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { UploadZone } from "~/components/video/UploadZone";
import { JobList } from "~/components/video/JobList";
import { WorkspaceSwitcher } from "~/components/workspace/WorkspaceSwitcher";
import { api } from "~/trpc/react";
import { useWorkspace } from "~/contexts/WorkspaceContext";
import { toast } from "sonner";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { workspace, isSwitching } = useWorkspace();
  
  // Fetch credits and job statistics
  const { data: credits, refetch: refetchCredits } = api.workspace.getCredits.useQuery();
  const { data: jobs, refetch: refetchJobs } = api.video.getJobs.useQuery();

  // Handle payment success/cancel
  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      toast.success("Payment successful! Credits have been added to your account.");
      refetchCredits();
      // Clear the query parameter
      router.replace("/dashboard");
    } else if (payment === "cancelled") {
      toast.error("Payment was cancelled. No charges were made.");
      // Clear the query parameter
      router.replace("/dashboard");
    }
  }, [searchParams, refetchCredits, router]);

  useEffect(() => {
    // Check authentication status and redirect if not authenticated
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);
  
  // Force refresh session and workspace on mount
  useEffect(() => {
    const checkSessionAndWorkspace = async () => {
      // Refresh session
      await fetch("/api/auth/session");
      
      // Refresh workspace info
      const workspaceResponse = await fetch("/api/workspace/info");
      if (workspaceResponse.ok) {
        const workspaceData = await workspaceResponse.json();
        console.log("Dashboard loaded workspace:", workspaceData);
        
        // Set workspace meta tags
        document.querySelector('meta[name="x-workspace-id"]')?.setAttribute('content', workspaceData.id);
        document.querySelector('meta[name="x-workspace-slug"]')?.setAttribute('content', workspaceData.slug);
        document.querySelector('meta[name="x-workspace-name"]')?.setAttribute('content', workspaceData.name);
        document.querySelector('meta[name="x-workspace-color"]')?.setAttribute('content', workspaceData.primaryColor || '#3b82f6');
        if (workspaceData.logoUrl) {
          document.querySelector('meta[name="x-workspace-logo"]')?.setAttribute('content', workspaceData.logoUrl);
        }
      }
    };
    checkSessionAndWorkspace();
  }, []);

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

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <WorkspaceSwitcher />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{credits?.credits || workspace?.credits || 0} Credits</Badge>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => router.push("/credits/buy")}
                  style={{
                    backgroundColor: workspace?.primaryColor || '#3b82f6',
                    color: 'white',
                    border: 'none'
                  }}
                  className="hover:opacity-90 transition-opacity"
                >
                  Buy Credits
                </Button>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  refetchCredits();
                  refetchJobs();
                }}
              >
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push("/settings")}
              >
                Settings
              </Button>
              <Button variant="outline" onClick={() => signOut()}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">
              Welcome back, {session.user.name || "User"}!
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload your video and we'll automatically remove all the silence, 
              making your content more engaging and professional.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{credits?.credits || workspace?.credits || 0}</CardTitle>
                <CardDescription>Credits Available</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{jobs?.filter(job => job.status === 'completed').length || 0}</CardTitle>
                <CardDescription>Videos Processed</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  {jobs?.filter(job => job.status === 'completed').reduce((total, job) => {
                    const originalDuration = job.duration || 0;
                    const processedDuration = job.processedDuration || 0;
                    return total + Math.max(0, originalDuration - processedDuration);
                  }, 0) || 0}s
                </CardTitle>
                <CardDescription>Time Saved</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Upload Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Upload Video</h2>
            <p className="text-muted-foreground mb-6">
              Drag and drop your video file or click to browse. We'll automatically remove silences.
            </p>
            <div className="mb-8">
              <UploadZone />
            </div>
          </div>

          {/* Recent Jobs */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Jobs</h2>
            <p className="text-muted-foreground mb-6">
              Track the status of your video processing jobs
            </p>
            <JobList />
          </div>
        </div>
      </main>

      {/* Workspace Switching Overlay */}
      {isSwitching && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span className="text-lg font-medium">Switching workspace...</span>
          </div>
        </div>
      )}
    </div>
  );
}