"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Download, 
  Trash2,
  Play,
  Pause,
  Eye,
  Film,
  RefreshCw
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useNotifications } from "~/contexts/NotificationContext";

const statusConfig = {
  queued: {
    label: "Queued",
    icon: Clock,
    variant: "secondary" as const,
    color: "text-yellow-600",
  },
  processing: {
    label: "Processing",
    icon: Play,
    variant: "default" as const,
    color: "text-blue-600",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    variant: "default" as const,
    color: "text-green-600",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    variant: "destructive" as const,
    color: "text-red-600",
  },
};

export function JobList() {
  const [isPolling, setIsPolling] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const previousJobsRef = useRef<any[] | null>(null);
  const { connected } = useNotifications();

  const { data: jobs, refetch, isLoading } = api.video.getJobs.useQuery({
    refetchInterval: 3000, // Poll every 3 seconds
    refetchOnWindowFocus: true, // Refetch when window gets focus
    refetchOnMount: true, // Refetch when component mounts
    refetchOnReconnect: true, // Refetch when reconnecting
  });
  
  const deleteJobMutation = api.video.deleteJob.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Video job deleted successfully");
    },
  });

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast.success("Job list refreshed");
  };

  // Show polling indicator if there are processing jobs
  useEffect(() => {
    const hasProcessingJobs = jobs?.some(
      (job) => job.status === "queued" || job.status === "processing"
    );
    setIsPolling(hasProcessingJobs || false);
  }, [jobs]);

  // Show notifications when job status changes
  useEffect(() => {
    if (!jobs || !previousJobsRef.current) {
      previousJobsRef.current = jobs;
      return;
    }

    const prevJobs = previousJobsRef.current;
    
    // Check for status changes
    jobs.forEach(job => {
      const prevJob = prevJobs.find(p => p.id === job.id);
      
      if (prevJob && prevJob.status !== job.status) {
        // Status changed
        if (job.status === "completed") {
          // Automatically open the video preview when processing completes
          setActiveVideoId(job.id);
          
          toast.success("Video processing complete! Your video is ready to view.", {
            duration: 5000,
            action: {
              label: "View",
              onClick: () => setActiveVideoId(job.id)
            }
          });
        } else if (job.status === "failed") {
          toast.error(`Video processing failed: ${job.errorMessage || "Unknown error"}`, {
            duration: 5000
          });
        } else if (job.status === "processing") {
          toast.info("Video processing started", {
            duration: 3000
          });
        }
      }
    });

    previousJobsRef.current = jobs;
  }, [jobs]);

  const handleDelete = async (jobId: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      await deleteJobMutation.mutateAsync({ id: jobId });
      if (activeVideoId === jobId) {
        setActiveVideoId(null);
      }
    }
  };

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download started");
  };
  
  const handleToggleVideoPreview = (jobId: string) => {
    if (activeVideoId === jobId) {
      setActiveVideoId(null);
    } else {
      setActiveVideoId(jobId);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Video Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Video Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No video jobs yet</p>
            <p className="text-sm">Upload a video to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>Video Jobs</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            {connected && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span>Connected</span>
              </div>
            )}
            {isPolling && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                <span>Processing</span>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobs.map((job) => {
            const config = statusConfig[job.status as keyof typeof statusConfig];
            const StatusIcon = config.icon;
            const isActive = activeVideoId === job.id;

            return (
              <div
                key={job.id}
                className={`border rounded-lg p-4 hover:bg-muted/50 transition-colors ${isActive ? 'border-primary' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className={`h-5 w-5 ${config.color}`} />
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={config.variant}>
                          {config.label}
                        </Badge>
                        {job.duration && (
                          <span className="text-sm text-muted-foreground">
                            {Math.round(job.duration)}s
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(job.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {job.status === "processing" && (
                      <div className="flex items-center space-x-2">
                        <Progress value={50} className="w-20" />
                        <Pause className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}

                    {job.status === "completed" && job.processedUrl && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleVideoPreview(job.id)}
                        >
                          {isActive ? (
                            <>
                              <Film className="h-4 w-4 mr-2" />
                              Hide
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDownload(
                              job.processedUrl!,
                              `processed-${job.id}.mp4`
                            )
                          }
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </>
                    )}

                    {job.status === "failed" && job.errorMessage && (
                      <div className="text-sm text-destructive max-w-xs">
                        {job.errorMessage}
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(job.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Video Preview */}
                {isActive && job.processedUrl && (
                  <div className="mt-4">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                      <video 
                        key={job.id} // Add key to force re-render when video changes
                        src={job.processedUrl} 
                        controls 
                        className="h-full w-full"
                        autoPlay
                        preload="auto"
                        onError={(e) => {
                          console.error("Video error:", e);
                          toast.error("Error loading video. Please try again.");
                        }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>Original duration: {job.duration ? Math.round(job.duration) : "Unknown"} seconds</p>
                      <p>Silences removed: This video has been processed to remove silent parts.</p>
                      <p className="mt-1 text-xs">Video URL: <code className="bg-muted p-1 rounded">{job.processedUrl}</code></p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
