"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { useWorkspace } from "~/contexts/WorkspaceContext";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { ArrowLeft, Upload, Palette, Globe, Image as ImageIcon } from "lucide-react";

export default function BrandingSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { workspace, refreshWorkspace } = useWorkspace();
  const [isUpdating, setIsUpdating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    primaryColor: "#3b82f6",
    logoUrl: "",
    customDomain: "",
  });

  // Update workspace settings mutation
  const updateSettings = api.workspace.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Branding settings updated successfully!");
      refreshWorkspace();
    },
    onError: (error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    },
  });

  // Initialize form with current workspace data
  useEffect(() => {
    if (workspace) {
      setFormData({
        name: workspace.name || "",
        primaryColor: workspace.primaryColor || "#3b82f6",
        logoUrl: workspace.logoUrl || "",
        customDomain: workspace.customDomain || "",
      });
    }
  }, [workspace]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      await updateSettings.mutateAsync({
        name: formData.name,
        primaryColor: formData.primaryColor,
        logoUrl: formData.logoUrl || undefined,
        customDomain: formData.customDomain || undefined,
      });
    } catch (error) {
      // Error is handled by the mutation's onError
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Branding Settings</h1>
                <p className="text-muted-foreground">Customize your workspace appearance</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                Live Preview
              </CardTitle>
              <CardDescription>
                See how your branding will look to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-card">
                <div className="flex items-center space-x-3 mb-4">
                  {formData.logoUrl ? (
                    <div className="h-10 w-10 rounded-lg overflow-hidden flex items-center justify-center">
                      <img
                        src={formData.logoUrl}
                        alt={`${formData.name} Logo`}
                        className="h-10 w-10 object-contain"
                      />
                    </div>
                  ) : (
                    <div 
                      className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: formData.primaryColor }}
                    >
                      {formData.name.charAt(0)?.toUpperCase() || 'V'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg">{formData.name || "Your Brand"}</h3>
                    <p className="text-sm text-muted-foreground">Video Processing Platform</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button 
                    size="sm"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    Primary Button
                  </Button>
                  <Badge 
                    variant="secondary"
                    style={{ 
                      backgroundColor: `${formData.primaryColor}20`,
                      color: formData.primaryColor,
                      borderColor: formData.primaryColor
                    }}
                  >
                    Branded Badge
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings Form */}
          <Card>
            <CardHeader>
              <CardTitle>Workspace Branding</CardTitle>
              <CardDescription>
                Customize your workspace name, colors, logo, and domain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Workspace Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Workspace Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your workspace name"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    This will be displayed throughout your workspace
                  </p>
                </div>

                {/* Primary Color */}
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center space-x-3">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Choose a color that represents your brand
                  </p>
                </div>

                {/* Logo URL */}
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <div className="flex items-center space-x-3">
                    <Input
                      id="logoUrl"
                      value={formData.logoUrl}
                      onChange={(e) => handleInputChange("logoUrl", e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    URL to your logo image (PNG, JPG, or SVG recommended)
                  </p>
                </div>

                {/* Custom Domain */}
                <div className="space-y-2">
                  <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="customDomain"
                      value={formData.customDomain}
                      onChange={(e) => handleInputChange("customDomain", e.target.value)}
                      placeholder="your-brand.com"
                      className="flex-1"
                    />
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Set up a custom domain for your white-labeled experience
                  </p>
                  {formData.customDomain && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Domain Setup Required:</strong> Point your domain's DNS to this application.
                        Contact support for assistance with domain configuration.
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUpdating}
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    {isUpdating ? "Updating..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* White-Label Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ImageIcon className="h-5 w-5" />
                White-Label Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Custom Domain</h4>
                    <p className="text-sm text-muted-foreground">
                      When users visit your custom domain, they'll see your branded landing page
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Global Branding</h4>
                    <p className="text-sm text-muted-foreground">
                      Your logo and colors will be applied throughout the entire application
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Custom Landing Page</h4>
                    <p className="text-sm text-muted-foreground">
                      Visitors to your domain see a fully customized landing page
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Branded Dashboard</h4>
                    <p className="text-sm text-muted-foreground">
                      Your workspace dashboard will display your branding
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
