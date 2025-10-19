"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { 
  ArrowLeft, 
  Zap, 
  Check,
  CreditCard,
  Shield,
  Clock
} from "lucide-react";
import { useWorkspace } from "~/contexts/WorkspaceContext";
import { toast } from "sonner";

export default function BuyCreditsPage() {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  // Create checkout session mutation
  const createCheckoutMutation = api.payment.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(error.message);
      setIsCreatingCheckout(false);
    },
  });

  const handleBuyCredits = () => {
    setIsCreatingCheckout(true);
    createCheckoutMutation.mutate({});
  };

  const features = [
    "100 video processing credits",
    "Automatic silence detection & removal",
    "High-quality video output",
    "Fast processing time",
    "Email notifications",
    "Lifetime validity (never expire)",
  ];

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
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Buy Credits</h1>
              <p className="text-muted-foreground">
                Process more videos with additional credits
              </p>
            </div>
          </div>
        </div>

        {/* Current Balance */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                  <p className="text-3xl font-bold">{workspace?.credits || 0} Credits</p>
                </div>
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Card */}
        <div className="max-w-4xl mx-auto">
          <Card className="relative overflow-hidden">
            {/* Popular Badge */}
            <div className="absolute top-4 right-4">
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                Best Value
              </Badge>
            </div>

            <CardHeader className="text-center pb-4">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl">Lifetime Deal</CardTitle>
              <CardDescription className="text-lg mt-2">
                One-time payment, lifetime access
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Price */}
              <div className="text-center py-6 border-y">
                <div className="flex items-baseline justify-center space-x-2">
                  <span className="text-5xl font-bold">$49</span>
                  <span className="text-xl text-muted-foreground">USD</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  100 credits • $0.49 per video
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <p className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  What's Included:
                </p>
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                <div className="text-center">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Secure Payment</p>
                </div>
                <div className="text-center">
                  <CreditCard className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Stripe Powered</p>
                </div>
                <div className="text-center">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Never Expire</p>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                size="lg"
                className="w-full text-lg h-14"
                onClick={handleBuyCredits}
                disabled={isCreatingCheckout}
                style={{
                  backgroundColor: workspace?.primaryColor || '#3b82f6',
                  color: 'white',
                  border: 'none'
                }}
              >
                {isCreatingCheckout ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    Redirecting to Checkout...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Buy 100 Credits for $49
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                You'll be redirected to Stripe for secure payment processing
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-12">
          <h3 className="text-xl font-bold mb-6 text-center">Frequently Asked Questions</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">How do credits work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Each video processing job consumes 1 credit. Upload a video, remove silence, and download the processed result.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Do credits expire?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No! Your credits never expire. Use them whenever you need them, at your own pace.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We accept all major credit cards through Stripe, including Visa, Mastercard, and American Express.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Is my payment secure?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Yes! All payments are processed securely through Stripe. We never store your credit card information.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
