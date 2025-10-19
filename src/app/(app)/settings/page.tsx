"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { 
  ArrowLeft, 
  Upload, 
  Palette, 
  Globe, 
  Save,
  Zap,
  Settings
} from "lucide-react";
import { Logo } from "~/components/ui/logo";
import { useWorkspace } from "~/contexts/WorkspaceContext";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { workspace } = useWorkspace();
  const [isSaving, setIsSaving] = useState(false);

  const { data: credits } = api.workspace.getCredits.useQuery();
  const updateSettingsMutation = api.workspace.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Settings updated successfully!");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [formData, setFormData] = useState({
    name: workspace?.name || "",
    primaryColor: workspace?.primaryColor || "#3b82f6",
    logoUrl: workspace?.logoUrl || "",
    customDomain: workspace?.customDomain || "",
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettingsMutation.mutateAsync(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
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
              <div className="flex items-center space-x-2">
                <Logo size="sm" />
                <span className="text-lg font-semibold">Settings</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {credits?.credits || 0} credits
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Workspace Settings</h1>
            <p className="text-muted-foreground">
              Customize your workspace branding and settings.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Basic Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Workspace Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="My Video Studio"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
                  <Input
                    id="customDomain"
                    value={formData.customDomain}
                    onChange={(e) => handleInputChange("customDomain", e.target.value)}
                    placeholder="mybrand.videoprocessor.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Set up a CNAME record pointing to your workspace for white-label branding.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Branding Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Branding</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="primaryColor"
                      value={formData.primaryColor}
                      onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                    <div
                      className="w-10 h-10 rounded border"
                      style={{ backgroundColor: formData.primaryColor }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    value={formData.logoUrl}
                    onChange={(e) => handleInputChange("logoUrl", e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a URL to your logo image. Recommended size: 200x200px
                  </p>
                </div>

                {formData.logoUrl && (
                  <div className="space-y-2">
                    <Label>Logo Preview</Label>
                    <div className="p-4 border rounded-lg flex items-center justify-center">
                      <img
                        src={formData.logoUrl}
                        alt="Logo preview"
                        className="max-h-16 max-w-16 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* White-Label Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>White-Label Branding</span>
              </CardTitle>
              <CardDescription>
                Customize your workspace appearance and domain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Branding Settings</h4>
                    <p className="text-sm text-muted-foreground">
                      Configure logo, colors, and custom domain
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => router.push("/settings/branding")}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Current Brand:</span>
                    <p className="text-muted-foreground">{workspace?.name || "Default"}</p>
                  </div>
                  <div>
                    <span className="font-medium">Custom Domain:</span>
                    <p className="text-muted-foreground">
                      {workspace?.customDomain || "Not configured"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credits Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Credits & Usage</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{credits?.credits || 0} credits</p>
                  <p className="text-sm text-muted-foreground">
                    Each video processing costs 1 credit
                  </p>
                </div>
                <Button onClick={() => router.push("/dashboard")}>
                  Buy More Credits
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving || updateSettingsMutation.isPending}
              className="min-w-32"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
