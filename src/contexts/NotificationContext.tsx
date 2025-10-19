"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type NotificationContextType = {
  connected: boolean;
  lastEventTime: Date | null;
};

const NotificationContext = createContext<NotificationContextType>({
  connected: false,
  lastEventTime: null,
});

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [connected, setConnected] = useState(false);
  const [lastEventTime, setLastEventTime] = useState<Date | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") {
      console.log("⚠️ NotificationProvider: Skipping SSE setup (server-side)");
      return;
    }

    // Connect regardless of authentication status for simplicity
    // In a production app, you would want to check authentication

    let eventSource: EventSource | undefined;

    const connectSSE = () => {
      try {
        // Close any existing connection
        if (eventSource) {
          eventSource.close();
        }

        // Create a new connection
        eventSource = new EventSource("/api/events");

        eventSource.onopen = () => {
          console.log("✅ SSE connection opened");
          setConnected(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setLastEventTime(new Date());

            if (data.type === "connected") {
              setConnected(true);
            } else if (data.type === "ping") {
              // Keep-alive ping - no action needed
            } else if (data.type === "job_update") {
              // Handle job status updates
              const { job } = data;
              
              if (job.status === "completed") {
                toast.success("Video processing complete!", {
                  description: "Your video is ready to view.",
                  duration: 5000,
                });
                
                // Refresh the page to show the latest jobs
                router.refresh();
              } else if (job.status === "failed") {
                toast.error("Video processing failed", {
                  description: job.errorMessage || "An error occurred during processing.",
                  duration: 5000,
                });
                
                // Refresh the page to show the latest jobs
                router.refresh();
              } else if (job.status === "processing") {
                toast.info("Video processing started", {
                  description: "Your video is being processed...",
                  duration: 3000,
                });
              }
            }
          } catch (error) {
            console.error("Error parsing SSE message:", error);
          }
        };

        eventSource.onerror = (error) => {
          console.error("SSE error:", error);
          setConnected(false);
          
          // Try to reconnect after a delay
          setTimeout(() => {
            if (eventSource) {
              eventSource.close();
              connectSSE();
            }
          }, 5000);
        };
      } catch (error) {
        console.error("Error setting up SSE:", error);
        setConnected(false);
      }
    };

    connectSSE();

    // Clean up on unmount
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [router]);

  return (
    <NotificationContext.Provider value={{ connected, lastEventTime }}>
      {children}
    </NotificationContext.Provider>
  );
}
