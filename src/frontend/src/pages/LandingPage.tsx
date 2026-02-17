import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wrench, Search, Shield, DollarSign, Users, Clock, MapPin, MessageSquare, Star } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import FloatingObjectsLayer from '../components/landing/FloatingObjectsLayer';
import InteractiveTilt from '../components/landing/InteractiveTilt';
import LandingImageBlock from '../components/landing/LandingImageBlock';
import LandingIllustrationImage from '../components/landing/LandingIllustrationImage';

export default function LandingPage() {
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <div className="flex flex-col relative min-h-screen">
      {/* Floating 3D Objects Background */}
      <FloatingObjectsLayer />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        
        <div className="container relative z-10 py-20 md:py-32 lg:py-40">
          <div className="mx-auto max-w-4xl text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
              <Wrench className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Community Tool Sharing</span>
            </div>
            
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              Share Tools,
              <br />
              <span className="text-primary">Build Community</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Rent tools from neighbors, list your unused equipment, and earn extra income. Peer-to-peer tool sharing made simple.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <InteractiveTilt intensity={0.8}>
                <Button size="lg" onClick={() => navigate({ to: '/browse' })} className="text-lg px-8 py-6 shadow-lg">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Tools
                </Button>
              </InteractiveTilt>
              {!isAuthenticated ? (
                <InteractiveTilt intensity={0.8}>
                  <Button size="lg" variant="outline" onClick={login} className="text-lg px-8 py-6">
                    Get Started
                  </Button>
                </InteractiveTilt>
              ) : (
                <InteractiveTilt intensity={0.8}>
                  <Button size="lg" variant="outline" onClick={() => navigate({ to: '/add-listing' })} className="text-lg px-8 py-6">
                    <Wrench className="mr-2 h-5 w-5" />
                    List a Tool
                  </Button>
                </InteractiveTilt>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* New Image Block Section */}
      <LandingImageBlock />

      {/* How It Works - Large Visual Section with Spot Illustrations */}
      <section className="relative py-24 md:py-32 border-b border-border/50">
        <div className="container relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to start sharing tools in your community
            </p>
          </div>
          
          <div className="grid gap-12 md:grid-cols-3 max-w-6xl mx-auto">
            <div className="text-center space-y-6">
              <div className="mx-auto w-48 h-48 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-lg overflow-hidden border border-primary/20">
                <LandingIllustrationImage
                  src="/assets/generated/how-it-works-spot-1.dim_512x512.png"
                  alt="Simple illustration of a magnifying glass over garage tools representing tool search"
                  width={512}
                  height={512}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold">Find Tools</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Browse available tools in your area. Filter by category, price, and availability to find exactly what you need.
                </p>
              </div>
            </div>

            <div className="text-center space-y-6">
              <div className="mx-auto w-48 h-48 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-lg overflow-hidden border border-primary/20">
                <LandingIllustrationImage
                  src="/assets/generated/how-it-works-spot-2.dim_512x512.png"
                  alt="Simple illustration of handshake with tools representing rental agreement"
                  width={512}
                  height={512}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold">Connect & Rent</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Send a rental request with your dates. Chat with the owner to arrange pickup and discuss details.
                </p>
              </div>
            </div>

            <div className="text-center space-y-6">
              <div className="mx-auto w-48 h-48 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-lg overflow-hidden border border-primary/20">
                <LandingIllustrationImage
                  src="/assets/generated/how-it-works-spot-3.dim_512x512.png"
                  alt="Simple illustration of completed project with tools representing successful rental"
                  width={512}
                  height={512}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold">Get It Done</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Pick up the tool, complete your project, and return it. Rate your experience and help the community grow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits - Consolidated Large Cards */}
      <section className="relative py-24 md:py-32 bg-muted/30">
        <div className="container relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">Why ToolShare?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join a community that values sharing, sustainability, and getting things done
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <InteractiveTilt intensity={0.6}>
              <Card className="border-2 hover:border-primary/50 transition-colors h-full">
                <CardContent className="pt-8 pb-8 space-y-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Save Money</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Rent tools for a fraction of the purchase price. No need to buy expensive equipment you'll rarely use.
                  </p>
                </CardContent>
              </Card>
            </InteractiveTilt>

            <InteractiveTilt intensity={0.6}>
              <Card className="border-2 hover:border-primary/50 transition-colors h-full">
                <CardContent className="pt-8 pb-8 space-y-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Earn Income</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    List your unused tools and earn money when they're rented. Turn idle equipment into steady income.
                  </p>
                </CardContent>
              </Card>
            </InteractiveTilt>

            <InteractiveTilt intensity={0.6}>
              <Card className="border-2 hover:border-primary/50 transition-colors h-full">
                <CardContent className="pt-8 pb-8 space-y-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Build Community</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Connect with neighbors, share resources, and strengthen local bonds through collaborative tool sharing.
                  </p>
                </CardContent>
              </Card>
            </InteractiveTilt>

            <InteractiveTilt intensity={0.6}>
              <Card className="border-2 hover:border-primary/50 transition-colors h-full">
                <CardContent className="pt-8 pb-8 space-y-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Secure Platform</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Built on Internet Computer with secure authentication. Your data and transactions are protected.
                  </p>
                </CardContent>
              </Card>
            </InteractiveTilt>

            <InteractiveTilt intensity={0.6}>
              <Card className="border-2 hover:border-primary/50 transition-colors h-full">
                <CardContent className="pt-8 pb-8 space-y-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Local Access</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Find tools nearby and support your local community. Reduce waste and environmental impact together.
                  </p>
                </CardContent>
              </Card>
            </InteractiveTilt>

            <InteractiveTilt intensity={0.6}>
              <Card className="border-2 hover:border-primary/50 transition-colors h-full">
                <CardContent className="pt-8 pb-8 space-y-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Star className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Quality Tools</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Access well-maintained equipment from trusted community members. Rate and review every rental.
                  </p>
                </CardContent>
              </Card>
            </InteractiveTilt>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-24 md:py-32 border-t border-border/50">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-background to-background" />
        
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center space-y-12">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold">Ready to Get Started?</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Join our community of tool sharers today and start building, creating, and connecting with your neighbors.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-6 bg-primary/5 rounded-xl border border-primary/20">
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <div className="text-sm text-muted-foreground">Tools Listed</div>
              </div>
              <div className="p-6 bg-primary/5 rounded-xl border border-primary/20">
                <div className="text-4xl font-bold text-primary mb-2">200+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="p-6 bg-primary/5 rounded-xl border border-primary/20">
                <div className="text-4xl font-bold text-primary mb-2">1000+</div>
                <div className="text-sm text-muted-foreground">Rentals</div>
              </div>
              <div className="p-6 bg-primary/5 rounded-xl border border-primary/20">
                <div className="text-4xl font-bold text-primary mb-2">4.8★</div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <InteractiveTilt intensity={0.8}>
                <Button size="lg" onClick={() => navigate({ to: '/browse' })} className="text-lg px-8 py-6 shadow-lg">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Tools
                </Button>
              </InteractiveTilt>
              {!isAuthenticated && (
                <InteractiveTilt intensity={0.8}>
                  <Button size="lg" variant="outline" onClick={login} className="text-lg px-8 py-6">
                    Sign Up Now
                  </Button>
                </InteractiveTilt>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border/50 py-8 bg-muted/20">
        <div className="container relative z-10">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} ToolShare. Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'toolshare'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
