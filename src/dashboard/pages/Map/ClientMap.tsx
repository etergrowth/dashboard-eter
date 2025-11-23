import { useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { useClients } from '../../hooks/useClients';
import { MapPin, Loader2 } from 'lucide-react';
import type { Client } from '../../../types';

const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '12px',
};

const defaultCenter = {
  lat: 38.7223, // Lisboa
  lng: -9.1393,
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
};

export function ClientMap() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const { data: clients, isLoading } = useClients();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Filter clients with valid coordinates
  const clientsWithLocation = clients?.filter(
    (c) => c.latitude !== null && c.longitude !== null
  ) || [];

  // Adjust map to fit all markers
  useEffect(() => {
    if (map && clientsWithLocation.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      clientsWithLocation.forEach((client) => {
        if (client.latitude && client.longitude) {
          bounds.extend(
            new google.maps.LatLng(
              Number(client.latitude),
              Number(client.longitude)
            )
          );
        }
      });
      map.fitBounds(bounds);
    }
  }, [map, clientsWithLocation]);

  const onLoad = (map: google.maps.Map) => {
    setMap(map);
  };

  const onUnmount = () => {
    setMap(null);
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="glass-panel p-12 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#7BA8F9] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">A carregar mapa...</p>
        </div>
      </div>
    );
  }

  if (clientsWithLocation.length === 0) {
    return (
      <div className="glass-panel p-12 rounded-xl text-center">
        <MapPin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          Nenhum cliente com localização
        </h3>
        <p className="text-gray-400">
          Adicione clientes com endereços para visualizá-los no mapa
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Total de Clientes</p>
          <p className="text-2xl font-bold text-white">{clients?.length || 0}</p>
        </div>
        <div className="glass-panel p-4 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Com Localização</p>
          <p className="text-2xl font-bold text-white">{clientsWithLocation.length}</p>
        </div>
        <div className="glass-panel p-4 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Sem Localização</p>
          <p className="text-2xl font-bold text-white">
            {(clients?.length || 0) - clientsWithLocation.length}
          </p>
        </div>
      </div>

      {/* Map */}
      <div className="glass-panel p-4 rounded-xl">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={10}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={mapOptions}
        >
          {clientsWithLocation.map((client) => (
            <Marker
              key={client.id}
              position={{
                lat: Number(client.latitude),
                lng: Number(client.longitude),
              }}
              onClick={() => setSelectedClient(client)}
              title={client.name}
            />
          ))}

          {selectedClient && selectedClient.latitude && selectedClient.longitude && (
            <InfoWindow
              position={{
                lat: Number(selectedClient.latitude),
                lng: Number(selectedClient.longitude),
              }}
              onCloseClick={() => setSelectedClient(null)}
            >
              <div className="p-2">
                <h3 className="font-bold text-gray-900 mb-1">
                  {selectedClient.name}
                </h3>
                {selectedClient.company && (
                  <p className="text-sm text-gray-600 mb-2">
                    {selectedClient.company}
                  </p>
                )}
                {selectedClient.address && (
                  <p className="text-xs text-gray-500">
                    {selectedClient.address}
                    {selectedClient.city && `, ${selectedClient.city}`}
                  </p>
                )}
                {selectedClient.phone && (
                  <p className="text-xs text-gray-500 mt-1">
                    📞 {selectedClient.phone}
                  </p>
                )}
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <span className={`text-xs px-2 py-1 rounded ${
                    selectedClient.status === 'closed'
                      ? 'bg-green-100 text-green-700'
                      : selectedClient.status === 'lead'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedClient.status}
                  </span>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
