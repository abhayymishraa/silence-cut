"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { ArrowLeft, Building2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function CreateWorkspacePage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    primaryColor: "#3b82f6",
    logoUrl: "",
  });

  const createWorkspaceMutation = api.workspace.createWorkspace.useMutation({
    onSuccess: (newWorkspace) => {
      toast.success(`Workspace "${newWorkspace.name}" created successfully!`);
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message);
      setIsCreating(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      await createWorkspaceMutation.mutateAsync({
        name: formData.name,
        slug: formData.slug,
        primaryColor: formData.primaryColor,
        logoUrl: formData.logoUrl || undefined,
      });
    } catch (error) {
      // Error is handled in onError callback
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

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
          
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Plus className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Create New Workspace</h1>
              <p className="text-muted-foreground">
                Set up a new workspace with custom branding and settings
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Workspace Details</span>
              </CardTitle>
              <CardDescription>
                Configure your new workspace settings. You can always change these later.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Workspace Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Workspace Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="My Awesome Workspace"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    disabled={isCreating}
                  />
                  <p className="text-sm text-muted-foreground">
                    This will be displayed as your workspace name throughout the app.
                  </p>
                </div>

                {/* Workspace Slug */}
                <div className="space-y-2">
                  <Label htmlFor="slug">Workspace Slug</Label>
                  <Input
                    id="slug"
                    type="text"
                    placeholder="my-awesome-workspace"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    required
                    disabled={isCreating}
                    pattern="^[a-z0-9-]+$"
                  />
                  <p className="text-sm text-muted-foreground">
                    Used in URLs and must be unique. Only lowercase letters, numbers, and hyphens allowed.
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
                      onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-16 h-10 p-1 border rounded"
                      disabled={isCreating}
                    />
                    <Input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                      placeholder="#3b82f6"
                      className="flex-1"
                      disabled={isCreating}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This color will be used throughout your workspace for branding.
                  </p>
                </div>

                {/* Logo URL */}
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
                  <Input
                    id="logoUrl"
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                    disabled={isCreating}
                  />
                  <p className="text-sm text-muted-foreground">
                    URL to your workspace logo. Will be displayed in the header and branding.
                  </p>
                </div>

                {/* Preview */}
                {formData.name && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="p-4 border rounded-lg bg-card">
                      <div className="flex items-center space-x-3">
                        {formData.logoUrl ? (
                          <div className="h-8 w-8 rounded overflow-hidden flex items-center justify-center">
                            <img
                              src={formData.logoUrl}
                              alt={`${formData.name} Logo`}
                              className="h-8 w-8 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <div 
                            className="h-8 w-8 rounded flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: formData.primaryColor }}
                          >
                            {formData.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-semibold">{formData.name}</span>
                        <Badge variant="secondary">Owner</Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isCreating || !formData.name || !formData.slug}
                    className="flex items-center space-x-2"
                  >
                    {isCreating ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Create Workspace</span>
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
