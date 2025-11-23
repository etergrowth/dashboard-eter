import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { Route, Waypoint } from '../../types';
import { useAuth } from './useAuth';

export function useRoutePlanner() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
    const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
    const [isOptimizing, setIsOptimizing] = useState(false);

    // Fetch saved routes
    const { data: savedRoutes, isLoading: loadingRoutes } = useQuery({
        queryKey: ['routes'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('routes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Route[];
        },
        enabled: !!user,
    });

    // Save route mutation
    const saveRoute = useMutation({
        mutationFn: async (routeData: { name: string; total_distance: string; total_duration: string }) => {
            const { data, error } = await supabase
                .from('routes')
                // @ts-ignore
                .insert({
                    user_id: user?.id,
                    name: routeData.name,
                    waypoints: waypoints,
                    total_distance: routeData.total_distance,
                    total_duration: routeData.total_duration,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routes'] });
        },
    });

    // Delete route mutation
    const deleteRoute = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('routes').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routes'] });
        },
    });

    // Add waypoint (Geocoding)
    const addWaypoint = useCallback(async (address: string) => {
        if (!window.google) return;

        const geocoder = new window.google.maps.Geocoder();

        try {
            const result = await geocoder.geocode({ address });

            if (result.results[0]) {
                const location = result.results[0].geometry.location;
                const newWaypoint: Waypoint = {
                    location: { lat: location.lat(), lng: location.lng() },
                    address: result.results[0].formatted_address,
                    stopover: true,
                };

                setWaypoints((prev) => [...prev, newWaypoint]);
                return newWaypoint;
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            throw error;
        }
    }, []);

    // Remove waypoint
    const removeWaypoint = useCallback((index: number) => {
        setWaypoints((prev) => prev.filter((_, i) => i !== index));
        setDirectionsResponse(null); // Reset directions when points change
    }, []);

    // Optimize Route
    const optimizeRoute = useCallback(async () => {
        if (waypoints.length < 2 || !window.google) return;

        setIsOptimizing(true);
        const directionsService = new window.google.maps.DirectionsService();

        const origin = waypoints[0].location;
        const destination = waypoints[waypoints.length - 1].location;
        const waypointsData = waypoints.slice(1, -1).map((wp) => ({
            location: wp.location,
            stopover: true,
        }));

        try {
            const result = await directionsService.route({
                origin,
                destination,
                waypoints: waypointsData,
                optimizeWaypoints: true,
                travelMode: window.google.maps.TravelMode.DRIVING,
            });

            setDirectionsResponse(result);

            // Reorder waypoints based on optimized order if needed
            // result.routes[0].waypoint_order contains the new order indices

        } catch (error) {
            console.error('Directions error:', error);
        } finally {
            setIsOptimizing(false);
        }
    }, [waypoints]);

    const loadRoute = useCallback((route: Route) => {
        setWaypoints(route.waypoints);
        // Trigger optimization/calculation immediately
        // optimizeRoute(); // This might need to be handled carefully to avoid stale state
    }, []);

    return {
        waypoints,
        addWaypoint,
        removeWaypoint,
        optimizeRoute,
        directionsResponse,
        isOptimizing,
        savedRoutes,
        loadingRoutes,
        saveRoute,
        deleteRoute,
        loadRoute,
        setWaypoints, // Exposed for clearing or manual updates
    };
}
