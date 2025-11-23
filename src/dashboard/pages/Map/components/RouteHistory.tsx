import { History, Map, Clock, Trash2, ArrowRight } from 'lucide-react';
import type { Route } from '../../../../types';

interface RouteHistoryProps {
    routes: Route[] | undefined;
    isLoading: boolean;
    onSelectRoute: (route: Route) => void;
    onDeleteRoute: (id: string) => void;
}

export function RouteHistory({ routes, isLoading, onSelectRoute, onDeleteRoute }: RouteHistoryProps) {
    if (isLoading) {
        return (
            <div className="p-4 text-center text-gray-400">
                A carregar histórico...
            </div>
        );
    }

    if (!routes || routes.length === 0) {
        return (
            <div className="p-8 text-center">
                <History className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Sem rotas guardadas</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 p-4">
            {routes.map((route) => (
                <div
                    key={route.id}
                    className="bg-[#1A1F2C] border border-white/10 rounded-xl p-4 hover:border-[#7BA8F9]/50 transition group"
                >
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h4 className="text-white font-medium text-sm">{route.name}</h4>
                            <p className="text-xs text-gray-500">
                                {new Date(route.created_at).toLocaleDateString('pt-PT', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                        <button
                            onClick={() => onDeleteRoute(route.id)}
                            className="text-gray-500 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                            <Map className="w-3 h-3" />
                            {route.total_distance}
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {route.total_duration}
                        </div>
                    </div>

                    <div className="space-y-1 mb-3">
                        {route.waypoints.slice(0, 2).map((wp, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-gray-500 truncate">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#7BA8F9]"></div>
                                <span className="truncate">{wp.address}</span>
                            </div>
                        ))}
                        {route.waypoints.length > 2 && (
                            <div className="text-xs text-gray-600 pl-3.5">
                                + {route.waypoints.length - 2} paragens
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => onSelectRoute(route)}
                        className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-white transition flex items-center justify-center gap-2"
                    >
                        Ver Rota
                        <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            ))}
        </div>
    );
}
