import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface ErrorStateCardProps {
  title?: string;
  description: string;
  action?: ReactNode;
}

export default function ErrorStateCard({ 
  title = 'Error', 
  description, 
  action 
}: ErrorStateCardProps) {
  return (
    <Card className="border-destructive">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle className="text-destructive">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {action && (
        <CardContent className="flex justify-center">
          {action}
        </CardContent>
      )}
    </Card>
  );
}
