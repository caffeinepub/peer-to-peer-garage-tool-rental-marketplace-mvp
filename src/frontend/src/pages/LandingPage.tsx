import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wrench, Search, Shield, DollarSign, Users, Clock, Hammer, Drill, Ruler, Paintbrush } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import ToolshedJourneySection from '../components/landing/ToolshedJourneySection';

export default function LandingPage() {
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <div className="flex flex-col relative">
      {/* Floating dust motes decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="motion-safe:animate-float-slow absolute top-[10%] left-[15%] w-2 h-2 bg-primary/20 rounded-full blur-sm" />
        <div className="motion-safe:animate-float-medium absolute top-[30%] right-[20%] w-1.5 h-1.5 bg-primary/15 rounded-full blur-sm" />
        <div className="motion-safe:animate-float-slow absolute top-[60%] left-[25%] w-2.5 h-2.5 bg-primary/10 rounded-full blur-sm" />
        <div className="motion-safe:animate-float-medium absolute top-[80%] right-[30%] w-1 h-1 bg-primary/20 rounded-full blur-sm" />
        <div className="motion-safe:animate-float-slow absolute top-[45%] right-[10%] w-2 h-2 bg-primary/15 rounded-full blur-sm" />
      </div>

      {/* Hero Section - Entrance to the Shed */}
      <section className="relative overflow-hidden border-b-4 border-primary/30 bg-gradient-to-b from-amber-50/80 via-orange-50/60 to-background dark:from-amber-950/30 dark:via-orange-950/20 dark:to-background">
        {/* Wood texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08] mix-blend-multiply dark:mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: 'url(/assets/generated/toolshed-wood-texture.dim_1024x1024.png)',
            backgroundSize: '400px 400px',
            backgroundRepeat: 'repeat'
          }}
        />
        
        <div className="container relative z-10 py-16 md:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center space-y-6">
              {/* Shed entrance sign */}
              <div className="inline-flex items-center gap-2 self-start px-4 py-2 bg-primary/10 border-2 border-primary/30 rounded-lg shadow-md motion-safe:animate-sway-gentle">
                <Wrench className="h-5 w-5 text-primary" />
                <span className="text-sm font-bold text-primary uppercase tracking-wide">Welcome to the Shed</span>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  Share Tools,
                  <br />
                  <span className="text-primary">Build Community</span>
                </h1>
                <p className="text-lg text-muted-foreground md:text-xl">
                  Step into our community workshop. Rent garage tools from your neighbors, list your unused equipment, and earn extra income. It's peer-to-peer tool sharing made simple.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={() => navigate({ to: '/browse' })} className="text-base shadow-lg">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Tools
                </Button>
                {!isAuthenticated ? (
                  <Button size="lg" variant="outline" onClick={login} className="text-base shadow-md">
                    Get Started
                  </Button>
                ) : (
                  <Button size="lg" variant="outline" onClick={() => navigate({ to: '/add-listing' })} className="text-base shadow-md">
                    <Wrench className="mr-2 h-5 w-5" />
                    List a Tool
                  </Button>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-orange-500/20 rounded-2xl blur-2xl motion-safe:animate-pulse-slow" />
              <img
                src="/assets/generated/toolshare-hero-toolshed.dim_1600x900.png"
                alt="Tool sharing community workshop"
                className="relative rounded-xl shadow-2xl border-4 border-primary/20"
              />
              {/* Decorative stickers */}
              <div className="absolute -top-3 -right-3 w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg motion-safe:animate-bounce-slow">
                <Hammer className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tool Aisle - Browse Section */}
      <ToolshedJourneySection
        label="Aisle 1: Power Tools"
        title="Find What You Need"
        description="Walk down our virtual aisles and discover tools for every project"
        icon={<Drill className="h-6 w-6" />}
        variant="light"
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-2 border-primary/20 shadow-md hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-orange-500/20 shadow-inner">
                <Search className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Find Tools</h3>
              <p className="text-muted-foreground">
                Browse available tools in your area. Search by category, price, and availability.
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-primary/20 shadow-md hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-orange-500/20 shadow-inner">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Request Rental</h3>
              <p className="text-muted-foreground">
                Send a rental request with your desired dates. Connect directly with tool owners.
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-primary/20 shadow-md hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-orange-500/20 shadow-inner">
                <Wrench className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Get the Job Done</h3>
              <p className="text-muted-foreground">
                Pick up the tool, complete your project, and return it. Rate your experience.
              </p>
            </CardContent>
          </Card>
        </div>
      </ToolshedJourneySection>

      {/* Workbench Section - Visual Break */}
      <section className="relative overflow-hidden border-y-4 border-primary/30 bg-gradient-to-r from-amber-100/50 via-orange-100/50 to-amber-100/50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-amber-950/20">
        <div 
          className="absolute inset-0 opacity-[0.05] dark:opacity-[0.12] mix-blend-multiply dark:mix-blend-overlay"
          style={{
            backgroundImage: 'url(/assets/generated/workbench-banner.dim_1600x600.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="container relative z-10 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg">
                <Ruler className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">The Workbench</h3>
                <p className="text-muted-foreground">Where projects come to life</p>
              </div>
            </div>
            <div className="flex gap-6 flex-wrap justify-center">
              <div className="flex items-center gap-2 px-4 py-2 bg-background/80 rounded-lg shadow-md border border-primary/20">
                <Hammer className="h-5 w-5 text-primary" />
                <span className="font-semibold">Power Tools</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-background/80 rounded-lg shadow-md border border-primary/20">
                <Wrench className="h-5 w-5 text-primary" />
                <span className="font-semibold">Hand Tools</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-background/80 rounded-lg shadow-md border border-primary/20">
                <Paintbrush className="h-5 w-5 text-primary" />
                <span className="font-semibold">Specialty</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tool Board - Benefits Section */}
      <ToolshedJourneySection
        label="Tool Board: Posted Benefits"
        title="Why ToolShare?"
        description="Check out what makes our community workshop special"
        icon={<Shield className="h-6 w-6" />}
        variant="muted"
      >
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex gap-4 p-6 bg-card rounded-xl border-2 border-primary/20 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-orange-500/20 shadow-inner">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="mb-2 font-bold text-lg">Save Money</h3>
              <p className="text-sm text-muted-foreground">
                Rent tools for a fraction of the purchase price. No need to buy expensive equipment you'll rarely use.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-6 bg-card rounded-xl border-2 border-primary/20 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-orange-500/20 shadow-inner">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="mb-2 font-bold text-lg">Secure Platform</h3>
              <p className="text-sm text-muted-foreground">
                Built on Internet Computer with secure authentication. Your data and transactions are protected.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-6 bg-card rounded-xl border-2 border-primary/20 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-orange-500/20 shadow-inner">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="mb-2 font-bold text-lg">Earn Extra Income</h3>
              <p className="text-sm text-muted-foreground">
                List your unused tools and earn money when they're rented. Turn idle equipment into income.
              </p>
            </div>
          </div>
        </div>
      </ToolshedJourneySection>

      {/* Journey Hero Section */}
      <section className="relative overflow-hidden border-y-4 border-primary/30">
        <div 
          className="absolute inset-0 opacity-20 dark:opacity-30"
          style={{
            backgroundImage: 'url(/assets/generated/toolshed-journey-hero.dim_1600x900.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80" />
        <div className="container relative z-10 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 border-2 border-primary/30 rounded-full shadow-lg motion-safe:animate-sway-gentle">
              <Wrench className="h-6 w-6 text-primary" />
              <span className="font-bold text-primary uppercase tracking-wide">Community Workshop</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
              Your Neighborhood Tool Library
            </h2>
            <p className="text-xl text-muted-foreground">
              Every tool has a story. Every project brings neighbors together. Join a community that believes in sharing, sustainability, and getting things done.
            </p>
          </div>
        </div>
      </section>

      {/* Exit CTA Section - Checkout Counter */}
      <ToolshedJourneySection
        label="Checkout Counter"
        title="Ready to Get Started?"
        description="Join our community of tool sharers today"
        icon={<Users className="h-6 w-6" />}
        variant="light"
      >
        <div className="mx-auto max-w-2xl text-center space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Tools Listed</div>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="text-3xl font-bold text-primary">200+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="text-3xl font-bold text-primary">1000+</div>
              <div className="text-sm text-muted-foreground">Rentals</div>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="text-3xl font-bold text-primary">4.8★</div>
              <div className="text-sm text-muted-foreground">Avg Rating</div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" onClick={() => navigate({ to: '/browse' })} className="text-base shadow-lg">
              <Search className="mr-2 h-5 w-5" />
              Browse Tools
            </Button>
            {!isAuthenticated && (
              <Button size="lg" variant="outline" onClick={login} className="text-base shadow-md">
                Sign Up Now
              </Button>
            )}
          </div>
        </div>
      </ToolshedJourneySection>

      {/* Decorative stickers overlay */}
      <div 
        className="fixed bottom-4 right-4 w-32 h-32 pointer-events-none opacity-10 dark:opacity-20 motion-safe:animate-float-slow z-0"
        style={{
          backgroundImage: 'url(/assets/generated/toolshed-ui-stickers.dim_1400x900.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      />
    </div>
  );
}
