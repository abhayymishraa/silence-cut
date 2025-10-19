"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { 
  ArrowLeft, 
  Building2, 
  Plus, 
  Settings, 
  Crown,
  User,
  Calendar,
  Zap
} from "lucide-react";
import { useWorkspace } from "~/contexts/WorkspaceContext";
import { toast } from "sonner";

export default function WorkspacesPage() {
  const router = useRouter();
  const { workspace: currentWorkspace, switchToWorkspace } = useWorkspace();
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);

  // Fetch user's workspaces
  const { data: workspaces, isLoading, refetch } = api.workspace.listUserWorkspaces.useQuery();
  
  // Switch workspace mutation
  const switchWorkspaceMutation = api.workspace.switchWorkspace.useMutation({
    onSuccess: async (newWorkspace) => {
      // Update workspace context
      await switchToWorkspace({
        id: newWorkspace.id,
        slug: newWorkspace.slug,
        name: newWorkspace.name,
        primaryColor: newWorkspace.primaryColor || '#3b82f6',
        logoUrl: newWorkspace.logoUrl,
        credits: newWorkspace.credits,
      });
      
      toast.success(`Switched to ${newWorkspace.name}`);
      setSwitchingTo(null);
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message);
      setSwitchingTo(null);
    },
  });

  const handleWorkspaceSwitch = (workspaceId: string) => {
    if (workspaceId === currentWorkspace?.id) return;
    
    setSwitchingTo(workspaceId);
    switchWorkspaceMutation.mutate({ workspaceId });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "admin":
        return <Settings className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "admin":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
              <p>Loading workspaces...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Workspaces</h1>
                <p className="text-muted-foreground">
                  Manage your workspaces and switch between them
                </p>
              </div>
            </div>
            
            <Button onClick={() => router.push("/workspaces/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Workspace
            </Button>
          </div>
        </div>

        {/* Workspaces Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workspaces?.map((ws) => (
            <Card 
              key={ws.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                ws.id === currentWorkspace?.id 
                  ? 'ring-2 ring-primary' 
                  : 'hover:ring-1 hover:ring-border'
              }`}
              onClick={() => handleWorkspaceSwitch(ws.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {ws.logoUrl ? (
                      <div className="h-10 w-10 rounded-lg overflow-hidden flex items-center justify-center">
                        <img
                          src={ws.logoUrl}
                          alt={`${ws.name} Logo`}
                          className="h-10 w-10 object-contain"
                        />
                      </div>
                    ) : (
                      <div 
                        className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: ws.primaryColor || '#3b82f6' }}
                      >
                        {ws.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    <div>
                      <CardTitle className="text-lg">{ws.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {ws.slug}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {ws.id === currentWorkspace?.id && (
                    <Badge variant="secondary">Current</Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Role and Credits */}
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="outline" 
                      className={`${getRoleColor(ws.role)}`}
                    >
                      {getRoleIcon(ws.role)}
                      <span className="ml-1">{ws.role}</span>
                    </Badge>
                    
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Zap className="h-3 w-3" />
                      <span>{ws.credits} credits</span>
                    </div>
                  </div>
                  
                  {/* Created Date */}
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Created {formatDate(ws.createdAt)}</span>
                  </div>
                  
                  {/* Action Button */}
                  <div className="pt-2">
                    <Button
                      variant={ws.id === currentWorkspace?.id ? "secondary" : "default"}
                      size="sm"
                      className="w-full"
                      disabled={switchingTo === ws.id}
                    >
                      {switchingTo === ws.id ? (
                        <>
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                          Switching...
                        </>
                      ) : ws.id === currentWorkspace?.id ? (
                        "Current Workspace"
                      ) : (
                        "Switch to Workspace"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {workspaces?.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No workspaces yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first workspace to get started with video processing.
            </p>
            <Button onClick={() => router.push("/workspaces/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Workspace
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
