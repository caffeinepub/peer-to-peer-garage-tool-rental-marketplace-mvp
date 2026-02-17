import LandingIllustrationImage from './LandingIllustrationImage';

export default function LandingImageBlock() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden border-b border-border/50">
      {/* Subtle texture background */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] landing-texture-bg" />
      
      <div className="container relative z-10">
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-2 items-center max-w-6xl mx-auto">
          {/* Text Content */}
          <div className="space-y-6 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
              <span className="text-sm font-semibold text-primary">Powered by Community</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Your Neighborhood
              <br />
              <span className="text-primary">Tool Library</span>
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Access thousands of tools without the cost of ownership. From power drills to lawn mowers, 
              find everything you need right in your community. Share resources, reduce waste, and build 
              lasting connections with neighbors who share your passion for getting things done.
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-card border border-border rounded-lg">
                <div className="text-3xl font-bold text-primary mb-1">$50+</div>
                <div className="text-sm text-muted-foreground">Avg. Savings per Rental</div>
              </div>
              <div className="p-4 bg-card border border-border rounded-lg">
                <div className="text-3xl font-bold text-primary mb-1">24/7</div>
                <div className="text-sm text-muted-foreground">Community Support</div>
              </div>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="order-1 lg:order-2">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-gradient-to-br from-primary/5 to-background">
              <LandingIllustrationImage
                src="/assets/generated/landing-hero-illustration.dim_1600x900.png"
                alt="Simple illustration of garage tools arranged on a workbench"
                width={1600}
                height={900}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
