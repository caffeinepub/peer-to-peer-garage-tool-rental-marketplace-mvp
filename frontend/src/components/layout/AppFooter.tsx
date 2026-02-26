import { Heart } from 'lucide-react';

export default function AppFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center text-sm text-muted-foreground">
          <p className="flex items-center gap-1.5">
            © 2026. Built with <Heart className="h-4 w-4 fill-current text-primary" /> using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground transition-colors hover:text-primary"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
