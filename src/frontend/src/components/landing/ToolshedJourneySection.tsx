import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface ToolshedJourneySectionProps {
  label: string;
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  variant?: 'light' | 'muted' | 'dark';
}

export default function ToolshedJourneySection({
  label,
  title,
  description,
  icon,
  children,
  variant = 'light'
}: ToolshedJourneySectionProps) {
  const bgClass = {
    light: 'bg-background',
    muted: 'bg-muted/30',
    dark: 'bg-gradient-to-b from-muted/50 to-background'
  }[variant];

  return (
    <section className={`relative border-b border-border ${bgClass}`}>
      {/* Wood texture for muted variant */}
      {variant === 'muted' && (
        <div 
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.06] mix-blend-multiply dark:mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: 'url(/assets/generated/toolshed-wood-texture.dim_1024x1024.png)',
            backgroundSize: '400px 400px',
            backgroundRepeat: 'repeat'
          }}
        />
      )}
      
      <div className="container relative z-10 py-16 md:py-24">
        {/* Section Label - Like a sign hanging in the shed */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 border-2 border-primary/30 rounded-lg shadow-md motion-safe:animate-sway-gentle">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
              {icon}
            </div>
            <span className="text-sm font-bold text-primary uppercase tracking-wide">
              {label}
            </span>
          </div>
        </div>

        {/* Section Header */}
        <div className="mb-12 text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>
        </div>

        {/* Section Content */}
        <div className="relative">
          {/* Decorative corner brackets - like shelf brackets */}
          <div className="absolute -top-4 -left-4 w-8 h-8 border-l-4 border-t-4 border-primary/20 rounded-tl-lg motion-reduce:hidden" />
          <div className="absolute -top-4 -right-4 w-8 h-8 border-r-4 border-t-4 border-primary/20 rounded-tr-lg motion-reduce:hidden" />
          
          {children}
        </div>
      </div>
    </section>
  );
}
