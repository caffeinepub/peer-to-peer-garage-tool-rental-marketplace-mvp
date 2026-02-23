import { useState } from 'react';
import { useRequestRental } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';

interface RentalRequestFormProps {
  toolId: bigint;
  isAvailable: boolean;
}

export default function RentalRequestForm({ toolId, isAvailable }: RentalRequestFormProps) {
  const navigate = useNavigate();
  const requestRental = useRequestRental();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      toast.error('End date must be after start date');
      return;
    }

    if (start < new Date()) {
      toast.error('Start date cannot be in the past');
      return;
    }

    try {
      // Convert Date to bigint timestamp (nanoseconds for IC)
      const startTimestamp = BigInt(start.getTime()) * BigInt(1_000_000);
      const endTimestamp = BigInt(end.getTime()) * BigInt(1_000_000);

      await requestRental.mutateAsync({
        toolId,
        startDate: startTimestamp,
        endDate: endTimestamp,
      });
      toast.success('Rental request submitted successfully!');
      navigate({ to: '/my-rentals' });
    } catch (error: any) {
      console.error('Rental request error:', error);
      toast.error(error.message || 'Failed to submit rental request');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Rental</CardTitle>
        <CardDescription>
          {isAvailable ? 'Select your rental dates' : 'This tool is currently unavailable'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={!isAvailable}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={!isAvailable}
              min={startDate || new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={!isAvailable || requestRental.isPending}>
            {requestRental.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Submit Request
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
