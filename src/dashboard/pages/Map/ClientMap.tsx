import { useEffect, useRef } from 'react';
import { useClients } from '../../hooks/useClients';
import { Loader2, MapPin } from 'lucide-react';
import '@googlemaps/extended-component-library/store_locator.js';
import '@googlemaps/extended-component-library/api_loader.js';

// Define custom elements types for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gmpx-store-locator': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'map-id'?: string;
      };
      'gmpx-api-loader': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        key?: string;
        'solution-channel'?: string;
      };
    }
  }
}

export function ClientMap() {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { data: clients, isLoading } = useClients();
  const locatorRef = useRef<any>(null);

  useEffect(() => {
    if (locatorRef.current && clients) {
      const locations = clients
        .filter(c => c.latitude && c.longitude)
        .map(c => ({
          title: c.name,
          address1: c.address || '',
          address2: c.city ? `${c.city}, ${c.country || 'Portugal'}` : '',
          coords: {
            lat: Number(c.latitude),
            lng: Number(c.longitude)
          },
          // Custom data can be added here if the component supports it, 
          // but standard fields are title, address1, address2, coords.
        }));

      const configuration = {
        locations: locations,
        mapOptions: {
          center: { lat: 38.7223, lng: -9.1393 },
          fullscreenControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          zoom: 7,
          zoomControl: true,
          maxZoom: 17,
          mapId: "DEMO_MAP_ID" // User provided this ID
        },
        mapsApiKey: googleMapsApiKey,
        capabilities: {
          input: true,
          autocomplete: true,
          directions: true,
          distanceMatrix: true,
          details: true,
          actions: true
        }
      };

      // Wait for the component to be defined before configuring
      customElements.whenDefined('gmpx-store-locator').then(() => {
        if (locatorRef.current) {
          locatorRef.current.configureFromQuickBuilder(configuration);
        }
      });
    }
  }, [clients, googleMapsApiKey]);

  if (isLoading) {
    return (
      <div className="glass-panel p-12 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#7BA8F9] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">A carregar mapa...</p>
        </div>
      </div>
    );
  }

  if (!googleMapsApiKey || googleMapsApiKey === 'PLACEHOLDER_KEY_PLEASE_REPLACE') {
    return (
      <div className="glass-panel p-12 rounded-xl text-center">
        <MapPin className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          Google Maps não configurado
        </h3>
        <p className="text-gray-400 mb-4">
          A chave da API do Google Maps não está configurada corretamente.
        </p>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-left max-w-md mx-auto">
          <p className="text-sm text-gray-300 mb-2">
            Adicione no arquivo <code className="bg-white/10 px-2 py-1 rounded">.env</code>:
          </p>
          <code className="text-xs text-blue-400 block bg-black/20 p-2 rounded">
            VITE_GOOGLE_MAPS_API_KEY=sua_chave_aqui
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[800px] w-full glass-panel rounded-xl overflow-hidden relative">
      <style>
        {`
          gmpx-store-locator {
            width: 100%;
            height: 100%;
            --gmpx-color-surface: #1A1F2C;
            --gmpx-color-on-surface: #ffffff;
            --gmpx-color-on-surface-variant: #9ca3af;
            --gmpx-color-primary: #7BA8F9;
            --gmpx-color-outline: #374151;
            --gmpx-fixed-panel-width-row-layout: 28.5em;
            --gmpx-fixed-panel-height-column-layout: 65%;
            --gmpx-font-family-base: "Inter", sans-serif;
            --gmpx-font-family-headings: "Inter", sans-serif;
            --gmpx-font-size-base: 0.875rem;
            --gmpx-hours-color-open: #4ade80;
            --gmpx-hours-color-closed: #f87171;
            --gmpx-rating-color: #fbbf24;
            --gmpx-rating-color-empty: #4b5563;
          }
          
          /* Dark mode tweaks for the internal components if accessible via shadow DOM or variables */
          .gmpx-suggest-input {
            background-color: #111827;
            color: white;
          }
        `}
      </style>

      <gmpx-api-loader
        key={googleMapsApiKey}
        solution-channel="GMP_QB_locatorplus_v11_cABD"
      />

      <gmpx-store-locator
        ref={locatorRef}
        map-id="DEMO_MAP_ID"
      />
    </div>
  );
}
