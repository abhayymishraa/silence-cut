"use client";

import { useWorkspace } from "~/contexts/WorkspaceContext";
import { WorkspaceSwitcher } from "~/components/workspace/WorkspaceSwitcher";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { api } from "~/trpc/react";

interface AppHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export function AppHeader({ title, showBackButton = false, onBackClick }: AppHeaderProps) {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const { data: session } = useSession();
  const { data: credits } = api.workspace.getCredits.useQuery();
  const { refetch: refetchCredits } = api.workspace.getCredits.useQuery();
  const { refetch: refetchJobs } = api.video.getJobs.useQuery();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Workspace Logo */}
            {workspace?.logoUrl ? (
              <div className="h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src={workspace.logoUrl}
                  alt={`${workspace.name} Logo`}
                  className="h-8 w-8 object-contain"
                />
              </div>
            ) : (
              <div 
                className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: workspace?.primaryColor || '#3b82f6' }}
              >
                {workspace?.name?.charAt(0)?.toUpperCase() || 'W'}
              </div>
            )}
            
            {/* Back Button */}
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
              >
                ← Back
              </Button>
            )}
            
            {/* Title */}
            {title && (
              <span className="text-lg font-semibold">{title}</span>
            )}
            
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
  );
}
