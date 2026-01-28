import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { MapPin, Car, Calendar, ChevronRight, Image } from 'lucide-react';
import type { Trip } from '@/types';

interface TripCardProps {
  trip: Trip;
  onClick?: () => void;
}

export function TripCard({ trip, onClick }: TripCardProps) {
  const statusColors = {
    draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  const statusLabels = {
    draft: 'Rascunho',
    completed: 'Concluída',
  };

  return (
    <div
      onClick={onClick}
      className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
      style={{ borderColor: 'hsl(var(--border))' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Date and Status */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(trip.date), "d 'de' MMMM, yyyy", { locale: pt })}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[trip.status]}`}
            >
              {statusLabels[trip.status]}
            </span>
          </div>

          {/* Reason */}
          <h4 className="font-medium text-foreground mb-2 line-clamp-1">
            {trip.reason}
          </h4>

          {/* Distance */}
          {trip.distance !== null && trip.distance > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <Car className="h-4 w-4 text-primary" />
              <span className="text-lg font-bold text-foreground">
                {trip.distance} km
              </span>
            </div>
          )}

          {/* Locations */}
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            {trip.start_location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-green-500" />
                <span className="line-clamp-1">{trip.start_location}</span>
              </div>
            )}
            {trip.end_location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-red-500" />
                <span className="line-clamp-1">{trip.end_location}</span>
              </div>
            )}
          </div>

          {/* KM readings */}
          {(trip.start_km || trip.end_km) && (
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              {trip.start_km && (
                <span>Início: {trip.start_km.toLocaleString('pt-PT')} km</span>
              )}
              {trip.end_km && (
                <span>Fim: {trip.end_km.toLocaleString('pt-PT')} km</span>
              )}
            </div>
          )}
        </div>

        {/* Photos indicator and chevron */}
        <div className="flex flex-col items-end gap-2">
          {(trip.start_photo_url || trip.end_photo_url) && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Image className="h-4 w-4" />
              <span className="text-xs">
                {[trip.start_photo_url, trip.end_photo_url].filter(Boolean).length}
              </span>
            </div>
          )}
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
