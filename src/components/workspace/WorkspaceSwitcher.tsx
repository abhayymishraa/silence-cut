"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Badge } from "~/components/ui/badge";
import { 
  ChevronDown, 
  Plus, 
  Settings, 
  Building2,
  Crown,
  User
} from "lucide-react";
import { useWorkspace } from "~/contexts/WorkspaceContext";
import { toast } from "sonner";

export function WorkspaceSwitcher() {
  const router = useRouter();
  const { workspace, switchToWorkspace, isSwitching } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);

  // Fetch user's workspaces
  const { data: workspaces, isLoading } = api.workspace.listUserWorkspaces.useQuery();
  
  // Switch workspace mutation
  const switchWorkspaceMutation = api.workspace.switchWorkspace.useMutation({
    onSuccess: async (newWorkspace) => {
      // Update workspace context using the new method
      await switchToWorkspace({
        id: newWorkspace.id,
        slug: newWorkspace.slug,
        name: newWorkspace.name,
        primaryColor: newWorkspace.primaryColor || '#3b82f6',
        logoUrl: newWorkspace.logoUrl,
        credits: newWorkspace.credits,
      });
      
      toast.success(`Switched to ${newWorkspace.name}`);
      setIsOpen(false);
      
      // Refresh the page to apply new workspace context
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleWorkspaceSwitch = (workspaceId: string) => {
    if (workspaceId === workspace?.id) return;
    
    switchWorkspaceMutation.mutate({ workspaceId });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case "admin":
        return <Settings className="h-3 w-3 text-blue-500" />;
      default:
        return <User className="h-3 w-3 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-yellow-100 text-yellow-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Button variant="outline" disabled>
        <Building2 className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[200px] justify-between" disabled={isSwitching}>
          <div className="flex items-center space-x-2">
            {isSwitching ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : workspace?.logoUrl ? (
              <div className="h-4 w-4 rounded overflow-hidden flex items-center justify-center">
                <img
                  src={workspace.logoUrl}
                  alt={`${workspace.name} Logo`}
                  className="h-4 w-4 object-contain"
                />
              </div>
            ) : (
              <div 
                className="h-4 w-4 rounded flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: workspace?.primaryColor || '#3b82f6' }}
              >
                {workspace?.name?.charAt(0)?.toUpperCase() || 'W'}
              </div>
            )}
            <span className="truncate">
              {isSwitching ? 'Switching...' : (workspace?.name || "Select Workspace")}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80" align="start">
        <DropdownMenuLabel>Switch Workspace</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {workspaces?.map((ws) => (
          <DropdownMenuItem
            key={ws.id}
            onClick={() => handleWorkspaceSwitch(ws.id)}
            className="flex items-center justify-between p-3 cursor-pointer"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {ws.logoUrl ? (
                <div className="h-6 w-6 rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                  <img
                    src={ws.logoUrl}
                    alt={`${ws.name} Logo`}
                    className="h-6 w-6 object-contain"
                  />
                </div>
              ) : (
                <div 
                  className="h-6 w-6 rounded flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: ws.primaryColor || '#3b82f6' }}
                >
                  {ws.name.charAt(0).toUpperCase()}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium truncate">{ws.name}</span>
                  {ws.id === workspace?.id && (
                    <Badge variant="secondary" className="text-xs">
                      Current
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getRoleColor(ws.role)}`}
                  >
                    {getRoleIcon(ws.role)}
                    <span className="ml-1">{ws.role}</span>
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {ws.credits} credits
                  </span>
                </div>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => router.push("/workspaces/new")}
          className="flex items-center space-x-2 p-3 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Workspace</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => router.push("/workspaces")}
          className="flex items-center space-x-2 p-3 cursor-pointer"
        >
          <Settings className="h-4 w-4" />
          <span>Manage Workspaces</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
