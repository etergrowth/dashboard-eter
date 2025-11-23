import { useState } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { useRoutePlanner } from '../../hooks/useRoutePlanner';
import { ChatInterface } from './components/ChatInterface';
import { RouteMap } from './components/RouteMap';
import { RouteHistory } from './components/RouteHistory';
import { Loader2, Map as MapIcon, Save, Navigation } from 'lucide-react';

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ['places'];

export function Map() {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey || '',
    libraries,
  });

  const {
    waypoints,
    addWaypoint,
    optimizeRoute,
    directionsResponse,
    isOptimizing,
    savedRoutes,
    loadingRoutes,
    saveRoute,
    deleteRoute,
    loadRoute,
    setWaypoints,
  } = useRoutePlanner();

  const [routeName, setRouteName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleSaveRoute = async () => {
    if (!routeName || !directionsResponse) return;

    const route = directionsResponse.routes[0];
    // Simplification for total distance/duration
    // Ideally sum up all legs
    let totalDistVal = 0;
    let totalDurVal = 0;
    route.legs.forEach(l => {
      totalDistVal += l.distance?.value || 0;
      totalDurVal += l.duration?.value || 0;
    });

    const totalDistance = `${(totalDistVal / 1000).toFixed(1)} km`;
    const totalDuration = `${Math.round(totalDurVal / 60)} min`;

    await saveRoute.mutateAsync({
      name: routeName,
      total_distance: totalDistance,
      total_duration: totalDuration,
    });

    setShowSaveModal(false);
    setRouteName('');
  };

  if (loadError) {
    return <div className="text-red-500">Error loading Google Maps</div>;
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-[#7BA8F9]" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex gap-6">
      {/* Left Sidebar: Chat & History */}
      <div className="w-96 flex flex-col gap-6">
        {/* Chat Interface */}
        <div className="h-1/2">
          <ChatInterface onAddAddress={addWaypoint} isProcessing={isOptimizing} />
        </div>

        {/* Route History */}
        <div className="h-1/2 glass-panel rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/10 bg-[#1A1F2C]">
            <h3 className="text-white font-medium flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-[#7BA8F9]" />
              Histórico de Rotas
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            <RouteHistory
              routes={savedRoutes}
              isLoading={loadingRoutes}
              onSelectRoute={loadRoute}
              onDeleteRoute={(id) => deleteRoute.mutate(id)}
            />
          </div>
        </div>
      </div>

      {/* Main Content: Map */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Map Header / Actions */}
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Planeador de Rotas AI</h2>
            <p className="text-sm text-gray-400">
              {waypoints.length} paragens • {directionsResponse ? 'Rota Otimizada' : 'A aguardar otimização'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setWaypoints([])}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition"
            >
              Limpar
            </button>
            <button
              onClick={optimizeRoute}
              disabled={waypoints.length < 2 || isOptimizing}
              className="glass-button px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:bg-[#7BA8F9]/20 transition disabled:opacity-50"
            >
              {isOptimizing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              Otimizar Rota
            </button>
            {directionsResponse && (
              <button
                onClick={() => setShowSaveModal(true)}
                className="glass-button px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:bg-green-500/20 transition"
              >
                <Save className="w-4 h-4" />
                Guardar
              </button>
            )}
          </div>
        </div>

        {/* Map View */}
        <div className="flex-1">
          <RouteMap
            waypoints={waypoints}
            directions={directionsResponse}
            onMapLoad={() => { }}
            mapOptions={{
              disableDefaultUI: false,
              zoomControl: true,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: true,
              styles: [
                {
                  featureType: "all",
                  elementType: "geometry",
                  stylers: [{ color: "#242f3e" }]
                },
                {
                  featureType: "all",
                  elementType: "labels.text.stroke",
                  stylers: [{ color: "#242f3e" }, { lightness: -80 }]
                },
                {
                  featureType: "all",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#746855" }]
                },
                {
                  featureType: "administrative.locality",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#d59563" }]
                },
                {
                  featureType: "poi",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#d59563" }]
                },
                {
                  featureType: "poi.park",
                  elementType: "geometry",
                  stylers: [{ color: "#263c3f" }]
                },
                {
                  featureType: "poi.park",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#6b9a76" }]
                },
                {
                  featureType: "road",
                  elementType: "geometry",
                  stylers: [{ color: "#38414e" }]
                },
                {
                  featureType: "road",
                  elementType: "geometry.stroke",
                  stylers: [{ color: "#212a37" }]
                },
                {
                  featureType: "road",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#9ca5b3" }]
                },
                {
                  featureType: "road.highway",
                  elementType: "geometry",
                  stylers: [{ color: "#746855" }]
                },
                {
                  featureType: "road.highway",
                  elementType: "geometry.stroke",
                  stylers: [{ color: "#1f2835" }]
                },
                {
                  featureType: "road.highway",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#f3d19c" }]
                },
                {
                  featureType: "water",
                  elementType: "geometry",
                  stylers: [{ color: "#17263c" }]
                },
                {
                  featureType: "water",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#515c6d" }]
                },
                {
                  featureType: "water",
                  elementType: "labels.text.stroke",
                  stylers: [{ lightness: -20 }]
                }
              ]
            }}
          />
        </div>
      </div>

      {/* Save Route Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1A1F2C] border border-white/10 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Guardar Rota</h3>
            <input
              type="text"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              placeholder="Nome da rota (ex: Vendas Lisboa Norte)"
              className="w-full px-4 py-2 bg-[#111827] border border-white/10 rounded-lg text-white mb-4 focus:outline-none focus:ring-2 focus:ring-[#7BA8F9]"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveRoute}
                disabled={!routeName.trim()}
                className="px-4 py-2 bg-[#7BA8F9] hover:bg-[#6092eb] rounded-lg text-white font-medium transition disabled:opacity-50"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
