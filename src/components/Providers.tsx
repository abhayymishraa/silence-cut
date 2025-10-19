"use client";

import { SessionProvider } from "next-auth/react";
import { TRPCReactProvider } from "~/trpc/react";
import { WorkspaceProvider } from "~/contexts/WorkspaceContext";
import { ThemeProvider } from "~/contexts/ThemeContext";
import { NotificationProvider } from "~/contexts/NotificationContext";
import { WhiteLabelProvider } from "~/components/WhiteLabelProvider";
import { WorkspaceMetaTags } from "~/app/WorkspaceMetaTags";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TRPCReactProvider>
        <WorkspaceProvider>
          <ThemeProvider>
            <NotificationProvider>
              <WhiteLabelProvider>
                <WorkspaceMetaTags />
                {children}
                <Toaster />
              </WhiteLabelProvider>
            </NotificationProvider>
          </ThemeProvider>
        </WorkspaceProvider>
      </TRPCReactProvider>
    </SessionProvider>
  );
}
