"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Upload, FileVideo, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function UploadZone() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const createJobMutation = api.video.createJob.useMutation({
    onSuccess: () => {
      toast.success("Video uploaded successfully!", {
        description: "Processing will begin shortly. You'll be notified when it's ready.",
        duration: 5000,
      });
      router.refresh();
    },
    onError: (error) => {
      toast.error("Upload failed", {
        description: error.message,
        duration: 5000,
      });
      setUploadError(error.message);
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      // Upload file
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const uploadData = await uploadResponse.json();
      setUploadProgress(50);

      // Create video job
      await createJobMutation.mutateAsync({
        originalUrl: uploadData.filePath,
        fileName: uploadData.fileName,
      });

      setUploadProgress(100);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }, [createJobMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".mkv", ".webm"],
    },
    maxSize: 300 * 1024 * 1024, // 300MB
    multiple: false,
    disabled: isUploading,
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-8">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }
            ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center space-y-4">
            {isUploading ? (
              <>
                <FileVideo className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Uploading video...</p>
                  <Progress value={uploadProgress} className="w-64" />
                  <p className="text-sm text-muted-foreground">
                    {uploadProgress < 50 ? "Uploading file..." : "Creating job..."}
                  </p>
                </div>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {isDragActive
                      ? "Drop your video here"
                      : "Drag & drop your video here"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to select a file
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports MP4, MOV, AVI, MKV, WebM (max 300MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {uploadError && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive">{uploadError}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
