import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import type { Waypoint } from '../../../../types';

interface RouteMapProps {
    waypoints: Waypoint[];
    directions: google.maps.DirectionsResult | null;
    onMapLoad: (map: google.maps.Map) => void;
    mapOptions: google.maps.MapOptions;
}

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '0.75rem',
};

const defaultCenter = {
    lat: 38.7223,
    lng: -9.1393,
};

export function RouteMap({ waypoints, directions, onMapLoad, mapOptions }: RouteMapProps) {
    return (
        <div className="w-full h-full glass-panel rounded-xl overflow-hidden relative">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={waypoints[0]?.location || defaultCenter}
                zoom={12}
                onLoad={onMapLoad}
                options={mapOptions}
            >
                {/* Render Waypoints as Markers */}
                {waypoints.map((wp, index) => (
                    <Marker
                        key={index}
                        position={wp.location}
                        label={(index + 1).toString()}
                        title={wp.address}
                    />
                ))}

                {/* Render Optimized Route */}
                {directions && (
                    <DirectionsRenderer
                        directions={directions}
                        options={{
                            suppressMarkers: true, // We use our own markers
                            polylineOptions: {
                                strokeColor: '#7BA8F9',
                                strokeWeight: 5,
                            },
                        }}
                    />
                )}
            </GoogleMap>
        </div>
    );
}
