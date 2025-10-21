"use client";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { 
  Play, 
  Zap, 
  Shield, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Star
} from "lucide-react";
import Link from "next/link";
import { useWorkspace } from "~/contexts/WorkspaceContext";
import Image from "next/image";
import { useEffect, useState } from "react";

export function WhiteLabeledLanding() {
  const { workspace } = useWorkspace();
  const [workspaceData, setWorkspaceData] = useState(workspace);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch workspace data directly for custom domains
    const fetchWorkspaceData = async () => {
      try {
        console.log('[WhiteLabeledLanding] Fetching workspace data for custom domain...');
        const response = await fetch('/api/workspace/current', {
          headers: {
            'Host': window.location.host,
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('[WhiteLabeledLanding] Fetched workspace data:', data);
          setWorkspaceData(data);
        } else {
          console.error('[WhiteLabeledLanding] Failed to fetch workspace data:', response.status);
        }
      } catch (error) {
        console.error('[WhiteLabeledLanding] Error fetching workspace data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Listen for workspace updates
    const handleWorkspaceUpdate = (event: CustomEvent) => {
      console.log('[WhiteLabeledLanding] Workspace updated:', event.detail);
      setWorkspaceData(event.detail);
      setIsLoading(false);
    };

    window.addEventListener('workspace-updated', handleWorkspaceUpdate as EventListener);

    // For custom domains, fetch data directly
    if (window.location.host === 'acme-video.test:3000') {
      fetchWorkspaceData();
    } else {
      setIsLoading(false);
    }

    return () => {
      window.removeEventListener('workspace-updated', handleWorkspaceUpdate as EventListener);
    };
  }, []);

  const brandName = workspaceData?.name || "Video Processor";
  const brandColor = workspaceData?.color || workspaceData?.primaryColor || "#3b82f6";
  const brandLogo = workspaceData?.logo || workspaceData?.logoUrl;
  
  console.log('[WhiteLabeledLanding] Workspace data:', workspaceData);
  console.log('[WhiteLabeledLanding] Brand color:', brandColor);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted workspace-branded">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {brandLogo ? (
                <div className="h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center">
                  <Image
                    src={brandLogo}
                    alt={`${brandName} Logo`}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
              ) : (
                <div 
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-primary-foreground font-bold"
                  style={{ backgroundColor: brandColor }}
                >
                  {brandName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xl font-bold">{brandName}</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button style={{ backgroundColor: brandColor }}>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <Badge variant="secondary" className="text-sm">
            <Zap className="h-3 w-3 mr-1" />
            AI-Powered Video Processing
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Remove Silence from
            <span 
              className="text-primary"
              style={{ color: brandColor }}
            >
              {" "}Videos
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Automatically detect and remove silent parts from your videos, 
            making your content more engaging and professional. Perfect for 
            content creators, educators, and businesses.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button 
                size="lg" 
                className="text-lg px-8"
                style={{ backgroundColor: brandColor }}
              >
                Start Processing Videos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>No registration required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Process up to 300MB</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>2-5 minute processing</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold">Why Choose {brandName}?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our advanced AI technology makes video editing effortless and professional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div 
                  className="h-12 w-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${brandColor}20` }}
                >
                  <Zap className="h-6 w-6" style={{ color: brandColor }} />
                </div>
                <CardTitle>Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Process your videos in just 2-5 minutes with our optimized algorithms.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div 
                  className="h-12 w-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${brandColor}20` }}
                >
                  <Shield className="h-6 w-6" style={{ color: brandColor }} />
                </div>
                <CardTitle>Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your videos are processed securely and deleted after processing.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div 
                  className="h-12 w-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${brandColor}20` }}
                >
                  <Clock className="h-6 w-6" style={{ color: brandColor }} />
                </div>
                <CardTitle>Save Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No more manual editing. Let AI handle the tedious work for you.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground">
              Pay only for what you use. No subscriptions, no hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Free Trial
                  <Badge variant="secondary">1 Credit</Badge>
                </CardTitle>
                <div className="text-3xl font-bold">$0</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>1 free video processing</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Up to 300MB file size</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>All video formats supported</span>
                  </li>
                </ul>
                <Link href="/signup" className="block">
                  <Button 
                    className="w-full"
                    style={{ backgroundColor: brandColor }}
                  >
                    Get Started Free
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-primary" style={{ borderColor: brandColor }}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Pro Package
                  <Badge style={{ backgroundColor: brandColor }}>100 Credits</Badge>
                </CardTitle>
                <div className="text-3xl font-bold">$49</div>
                <p className="text-sm text-muted-foreground">One-time payment</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>100 video processings</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Up to 300MB file size</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Priority processing</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Email support</span>
                  </li>
                </ul>
                <Link href="/signup" className="block">
                  <Button 
                    className="w-full"
                    style={{ backgroundColor: brandColor }}
                  >
                    Upgrade to Pro
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              {brandLogo ? (
                <div className="h-6 w-6 rounded overflow-hidden flex items-center justify-center">
                  <Image
                    src={brandLogo}
                    alt={`${brandName} Logo`}
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
              ) : (
                <div 
                  className="h-6 w-6 rounded flex items-center justify-center text-primary-foreground text-xs font-bold"
                  style={{ backgroundColor: brandColor }}
                >
                  {brandName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="font-semibold">{brandName}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 {brandName}. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
