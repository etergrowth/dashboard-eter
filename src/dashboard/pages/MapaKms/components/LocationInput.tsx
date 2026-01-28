import { useState } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface LocationInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onCoordinatesChange?: (lat: number, lng: number) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function LocationInput({
  label,
  value,
  onChange,
  onCoordinatesChange,
  disabled,
  placeholder = 'Ex: Rua Augusta, Lisboa',
}: LocationInputProps) {
  const [isLocating, setIsLocating] = useState(false);

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não suportada neste dispositivo');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        onCoordinatesChange?.(latitude, longitude);

        // Reverse geocoding using Google Maps API (if available)
        if (window.google?.maps?.Geocoder) {
          try {
            const geocoder = new window.google.maps.Geocoder();
            const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
              geocoder.geocode(
                { location: { lat: latitude, lng: longitude } },
                (results, status) => {
                  if (status === 'OK' && results) {
                    resolve(results);
                  } else {
                    reject(new Error('Geocoding failed'));
                  }
                }
              );
            });

            if (result[0]) {
              onChange(result[0].formatted_address);
            }
          } catch (error) {
            console.error('Geocoding error:', error);
            onChange(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }
        } else {
          // Fallback: use coordinates as text
          onChange(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }

        setIsLocating(false);
        toast.success('Localização obtida');
      },
      (error) => {
        setIsLocating(false);
        console.error('Geolocation error:', error);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Permissão de localização negada');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Localização indisponível');
            break;
          case error.TIMEOUT:
            toast.error('Tempo limite para obter localização');
            break;
          default:
            toast.error('Erro ao obter localização');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        {label}
      </label>

      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || isLocating}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleGetLocation}
          disabled={disabled || isLocating}
          title="Usar localização atual"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Clique no botão para usar a sua localização atual
      </p>
    </div>
  );
}

// Add Google Maps types for TypeScript
declare global {
  interface Window {
    google?: {
      maps?: {
        Geocoder: new () => google.maps.Geocoder;
      };
    };
  }
}
