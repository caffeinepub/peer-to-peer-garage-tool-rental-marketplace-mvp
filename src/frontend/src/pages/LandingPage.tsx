import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wrench, Search, Shield, DollarSign, Users, Clock } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function LandingPage() {
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-muted/50 to-background">
        <div className="container py-16 md:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  Share Tools,
                  <br />
                  <span className="text-primary">Build Community</span>
                </h1>
                <p className="text-lg text-muted-foreground md:text-xl">
                  Rent garage tools from your neighbors. List your unused tools and earn extra income. It's peer-to-peer tool sharing made simple.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={() => navigate({ to: '/browse' })} className="text-base">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Tools
                </Button>
                {!isAuthenticated ? (
                  <Button size="lg" variant="outline" onClick={login} className="text-base">
                    Get Started
                  </Button>
                ) : (
                  <Button size="lg" variant="outline" onClick={() => navigate({ to: '/add-listing' })} className="text-base">
                    <Wrench className="mr-2 h-5 w-5" />
                    List a Tool
                  </Button>
                )}
              </div>
            </div>
            <div className="relative">
              <img
                src="/assets/generated/toolshare-hero.dim_1600x900.png"
                alt="Tool sharing community"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16 md:py-24">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">How It Works</h2>
          <p className="text-lg text-muted-foreground">Simple, secure, and community-driven</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Find Tools</h3>
              <p className="text-muted-foreground">
                Browse available tools in your area. Search by category, price, and availability.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Request Rental</h3>
              <p className="text-muted-foreground">
                Send a rental request with your desired dates. Connect directly with tool owners.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Get the Job Done</h3>
              <p className="text-muted-foreground">
                Pick up the tool, complete your project, and return it. Rate your experience.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="border-t border-border bg-muted/30">
        <div className="container py-16 md:py-24">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Why ToolShare?</h2>
            <p className="text-lg text-muted-foreground">Benefits for renters and owners</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold">Save Money</h3>
                <p className="text-sm text-muted-foreground">
                  Rent tools for a fraction of the purchase price. No need to buy expensive equipment you'll rarely use.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold">Secure Platform</h3>
                <p className="text-sm text-muted-foreground">
                  Built on Internet Computer with secure authentication. Your data and transactions are protected.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold">Earn Extra Income</h3>
                <p className="text-sm text-muted-foreground">
                  List your unused tools and earn money when they're rented. Turn idle equipment into income.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Ready to Get Started?</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join our community of tool sharers today. List your tools or find what you need.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" onClick={() => navigate({ to: '/browse' })}>
                <Search className="mr-2 h-5 w-5" />
                Browse Tools
              </Button>
              {!isAuthenticated && (
                <Button size="lg" variant="outline" onClick={login}>
                  Sign Up Now
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
