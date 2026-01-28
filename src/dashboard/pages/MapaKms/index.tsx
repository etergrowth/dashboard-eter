import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  Plus,
  Download,
  Car,
  Calendar,
  TrendingUp,
  Search,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTripsByMonth, useTripStats, useDeleteTrip } from '@/dashboard/hooks/useTrips';
import { MonthlyGroup } from './components/MonthlyGroup';
import type { Trip } from '@/types';
import { toast } from 'sonner';

export function MapaKms() {
  const navigate = useNavigate();
  const { data: groupedTrips, isLoading } = useTripsByMonth();
  const { data: stats } = useTripStats();
  const deleteTrip = useDeleteTrip();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  // Filter trips based on search term
  const filteredGroups = groupedTrips?.map((group) => ({
    ...group,
    trips: group.trips.filter(
      (trip) =>
        trip.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.start_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.end_location?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter((group) => group.trips.length > 0);

  const handleExportCSV = () => {
    if (!groupedTrips || groupedTrips.length === 0) {
      toast.error('Sem dados para exportar');
      return;
    }

    // Flatten all trips
    const allTrips = groupedTrips.flatMap((g) => g.trips);

    // CSV Headers (PT-PT)
    const headers = [
      'Data',
      'Motivo',
      'Km Inicial',
      'Km Final',
      'Distância (km)',
      'Local Partida',
      'Local Chegada',
      'Estado',
    ];

    // CSV Rows
    const rows = allTrips.map((trip) => [
      format(new Date(trip.date), 'dd/MM/yyyy'),
      `"${trip.reason.replace(/"/g, '""')}"`,
      trip.start_km || '',
      trip.end_km || '',
      trip.distance || '',
      trip.start_location ? `"${trip.start_location.replace(/"/g, '""')}"` : '',
      trip.end_location ? `"${trip.end_location.replace(/"/g, '""')}"` : '',
      trip.status === 'completed' ? 'Concluída' : 'Rascunho',
    ]);

    // Build CSV content
    const csvContent = [
      headers.join(';'),
      ...rows.map((row) => row.join(';')),
    ].join('\n');

    // Add BOM for Excel compatibility
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    // Download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `mapa_kms_${format(new Date(), 'yyyy-MM-dd')}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('CSV exportado com sucesso');
  };

  const handleTripClick = (trip: Trip) => {
    setSelectedTrip(trip);
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm('Tem certeza que deseja eliminar esta viagem?')) return;

    try {
      await deleteTrip.mutateAsync(tripId);
      toast.success('Viagem eliminada');
      setSelectedTrip(null);
    } catch {
      toast.error('Erro ao eliminar viagem');
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Mapa de Kms</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
            Registe e acompanhe as suas deslocações
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/dashboard/mapa-kms/nova')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Viagem</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="p-4 rounded-lg border bg-card" style={{ borderColor: 'hsl(var(--border))' }}>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Car className="h-4 w-4" />
            <span className="text-xs">Este Mês</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {stats?.thisMonthKm?.toLocaleString('pt-PT') || 0}
            <span className="text-sm font-normal text-muted-foreground ml-1">km</span>
          </p>
        </div>

        <div className="p-4 rounded-lg border bg-card" style={{ borderColor: 'hsl(var(--border))' }}>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Viagens Mês</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {stats?.thisMonthCount || 0}
          </p>
        </div>

        <div className="p-4 rounded-lg border bg-card" style={{ borderColor: 'hsl(var(--border))' }}>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">Total Acumulado</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {stats?.totalKm?.toLocaleString('pt-PT') || 0}
            <span className="text-sm font-normal text-muted-foreground ml-1">km</span>
          </p>
        </div>

        <div className="p-4 rounded-lg border bg-card" style={{ borderColor: 'hsl(var(--border))' }}>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Car className="h-4 w-4" />
            <span className="text-xs">Média p/ Viagem</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {stats?.avgDistance || 0}
            <span className="text-sm font-normal text-muted-foreground ml-1">km</span>
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar viagens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Trip List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      ) : filteredGroups && filteredGroups.length > 0 ? (
        <div className="space-y-6">
          {filteredGroups.map((group) => (
            <MonthlyGroup
              key={group.month}
              label={group.label}
              totalKm={group.totalKm}
              trips={group.trips}
              onTripClick={handleTripClick}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Car className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">
            {searchTerm ? 'Nenhuma viagem encontrada' : 'Sem viagens registadas'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchTerm
              ? 'Tente outro termo de pesquisa'
              : 'Comece por registar a sua primeira viagem'}
          </p>
          {!searchTerm && (
            <Button onClick={() => navigate('/dashboard/mapa-kms/nova')}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Viagem
            </Button>
          )}
        </div>
      )}

      {/* Trip Detail Modal */}
      {selectedTrip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setSelectedTrip(null)}
        >
          <div
            className="w-full max-w-md rounded-lg border bg-card p-6 shadow-xl"
            style={{ borderColor: 'hsl(var(--border))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Detalhes da Viagem</h3>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Data:</span>
                <span className="ml-2 text-foreground">
                  {format(new Date(selectedTrip.date), "d 'de' MMMM, yyyy", { locale: pt })}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground">Motivo:</span>
                <span className="ml-2 text-foreground">{selectedTrip.reason}</span>
              </div>

              {selectedTrip.distance !== null && (
                <div>
                  <span className="text-muted-foreground">Distância:</span>
                  <span className="ml-2 text-foreground font-bold">
                    {selectedTrip.distance} km
                  </span>
                </div>
              )}

              {selectedTrip.start_km && (
                <div>
                  <span className="text-muted-foreground">Km Inicial:</span>
                  <span className="ml-2 text-foreground">
                    {selectedTrip.start_km.toLocaleString('pt-PT')}
                  </span>
                </div>
              )}

              {selectedTrip.end_km && (
                <div>
                  <span className="text-muted-foreground">Km Final:</span>
                  <span className="ml-2 text-foreground">
                    {selectedTrip.end_km.toLocaleString('pt-PT')}
                  </span>
                </div>
              )}

              {selectedTrip.start_location && (
                <div>
                  <span className="text-muted-foreground">Partida:</span>
                  <span className="ml-2 text-foreground">{selectedTrip.start_location}</span>
                </div>
              )}

              {selectedTrip.end_location && (
                <div>
                  <span className="text-muted-foreground">Chegada:</span>
                  <span className="ml-2 text-foreground">{selectedTrip.end_location}</span>
                </div>
              )}

              {/* Photos */}
              {(selectedTrip.start_photo_url || selectedTrip.end_photo_url) && (
                <div className="pt-2">
                  <span className="text-muted-foreground block mb-2">Fotos:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedTrip.start_photo_url && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Início</p>
                        <img
                          src={selectedTrip.start_photo_url}
                          alt="Odómetro início"
                          className="w-full h-24 object-cover rounded-md"
                        />
                      </div>
                    )}
                    {selectedTrip.end_photo_url && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Fim</p>
                        <img
                          src={selectedTrip.end_photo_url}
                          alt="Odómetro fim"
                          className="w-full h-24 object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedTrip(null)}
              >
                Fechar
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteTrip(selectedTrip.id)}
                disabled={deleteTrip.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
