import { Car } from 'lucide-react';
import type { Trip } from '@/types';
import { TripCard } from './TripCard';

interface MonthlyGroupProps {
  label: string;
  totalKm: number;
  trips: Trip[];
  onTripClick?: (trip: Trip) => void;
}

export function MonthlyGroup({ label, totalKm, trips, onTripClick }: MonthlyGroupProps) {
  return (
    <div className="space-y-3">
      {/* Month Header */}
      <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
        <h3 className="text-lg font-semibold capitalize text-foreground">
          {label}
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Car className="h-4 w-4" />
          <span className="font-medium text-foreground">{totalKm.toLocaleString('pt-PT')} km</span>
          <span className="text-xs">({trips.length} viagens)</span>
        </div>
      </div>

      {/* Trip Cards */}
      <div className="space-y-2">
        {trips.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            onClick={() => onTripClick?.(trip)}
          />
        ))}
      </div>
    </div>
  );
}
