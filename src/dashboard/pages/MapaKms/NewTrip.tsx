import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Camera,
  MapPin,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateTrip, useUpdateTrip, useUploadOdometerPhoto } from '@/dashboard/hooks/useTrips';
import { OdometerCapture } from './components/OdometerCapture';
import { LocationInput } from './components/LocationInput';
import { toast } from 'sonner';
import type { TripInsert } from '@/types';

type Step = 1 | 2 | 3 | 4;

interface TripFormData {
  date: string;
  reason: string;
  start_km: number | null;
  end_km: number | null;
  start_location: string;
  end_location: string;
  start_lat: number | null;
  start_lng: number | null;
  end_lat: number | null;
  end_lng: number | null;
  start_photo_file: File | null;
  start_photo_base64: string | null;
  end_photo_file: File | null;
  end_photo_base64: string | null;
}

const STEPS = [
  { id: 1, title: 'Motivo', icon: FileText },
  { id: 2, title: 'Km Início', icon: Camera },
  { id: 3, title: 'Km Fim', icon: Camera },
  { id: 4, title: 'Locais', icon: MapPin },
] as const;

export function NewTrip() {
  const navigate = useNavigate();
  const createTrip = useCreateTrip();
  const updateTrip = useUpdateTrip();
  const uploadPhoto = useUploadOdometerPhoto();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<TripFormData>({
    date: format(new Date(), 'yyyy-MM-dd'),
    reason: '',
    start_km: null,
    end_km: null,
    start_location: '',
    end_location: '',
    start_lat: null,
    start_lng: null,
    end_lat: null,
    end_lng: null,
    start_photo_file: null,
    start_photo_base64: null,
    end_photo_file: null,
    end_photo_base64: null,
  });

  const updateForm = <K extends keyof TripFormData>(key: K, value: TripFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return formData.reason.trim().length >= 3;
      case 2:
        return formData.start_km !== null && formData.start_km > 0;
      case 3:
        // Step 3 is optional - can proceed without end_km
        return true;
      case 4:
        // Step 4 is optional - can proceed without locations
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((s) => (s + 1) as Step);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => (s - 1) as Step);
    }
  };

  // Função para sanitizar texto removendo HTML
  const sanitizeText = (text: string): string => {
    // Remove tags HTML
    let sanitized = text.replace(/<[^>]*>/g, '');
    // Decodifica entidades HTML comuns
    sanitized = sanitized
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
    // Remove espaços extras
    return sanitized.trim();
  };

  const handleSubmit = async (status: 'draft' | 'completed') => {
    if (!canProceed()) {
      toast.error('Por favor preencha os campos obrigatórios');
      return;
    }

    // Validação e sanitização adicional
    const trimmedReason = formData.reason.trim();
    if (!trimmedReason || trimmedReason.length < 3) {
      toast.error('O motivo da viagem deve ter pelo menos 3 caracteres');
      return;
    }

    // Sanitizar o campo reason para remover HTML
    const sanitizedReason = sanitizeText(trimmedReason);
    if (!sanitizedReason || sanitizedReason.length < 3) {
      toast.error('O motivo da viagem contém caracteres inválidos');
      return;
    }

    setIsSubmitting(true);

    try {
      // Calcular distância se houver start_km e end_km
      const distance = 
        formData.start_km !== null && 
        formData.end_km !== null && 
        formData.end_km > formData.start_km
          ? formData.end_km - formData.start_km
          : null;

      // 1. Create trip first
      const tripData: TripInsert = {
        date: new Date(formData.date).toISOString(),
        reason: sanitizedReason,
        start_km: formData.start_km,
        end_km: formData.end_km,
        start_location: formData.start_location?.trim() || null,
        end_location: formData.end_location?.trim() || null,
        start_lat: formData.start_lat,
        start_lng: formData.start_lng,
        end_lat: formData.end_lat,
        end_lng: formData.end_lng,
        status,
        // user_id será adicionado automaticamente pelo hook useCreateTrip
      };

      const trip = await createTrip.mutateAsync(tripData);

      // 2. Upload photos if available
      let startPhotoUrl: string | null = null;
      let endPhotoUrl: string | null = null;

      if (formData.start_photo_file) {
        try {
          const result = await uploadPhoto.mutateAsync({
            file: formData.start_photo_file,
            tripId: trip.id,
            type: 'start',
          });
          startPhotoUrl = result.publicUrl;
        } catch (photoError) {
          console.error('Error uploading start photo:', photoError);
          // Continuar mesmo se upload de foto falhar
        }
      }

      if (formData.end_photo_file) {
        try {
          const result = await uploadPhoto.mutateAsync({
            file: formData.end_photo_file,
            tripId: trip.id,
            type: 'end',
          });
          endPhotoUrl = result.publicUrl;
        } catch (photoError) {
          console.error('Error uploading end photo:', photoError);
          // Continuar mesmo se upload de foto falhar
        }
      }

      // 3. Update trip with distance and photo URLs in a single update
      const updateData: any = {};
      if (distance !== null) {
        updateData.distance = distance;
      }
      if (startPhotoUrl) {
        updateData.start_photo_url = startPhotoUrl;
      }
      if (endPhotoUrl) {
        updateData.end_photo_url = endPhotoUrl;
      }

      if (Object.keys(updateData).length > 0) {
        await updateTrip.mutateAsync({
          id: trip.id,
          ...updateData,
        });
      }

      toast.success(
        status === 'completed'
          ? 'Viagem registada com sucesso!'
          : 'Rascunho guardado'
      );
      navigate('/dashboard/mapa-kms');
    } catch (error: any) {
      console.error('Error creating trip:', error);
      
      // Mostrar mensagem de erro mais específica
      let errorMessage = 'Erro ao guardar viagem';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Mensagens mais amigáveis para erros comuns
      if (errorMessage.includes('violates') || errorMessage.includes('constraint')) {
        errorMessage = 'Erro: Dados inválidos. Verifique os campos preenchidos.';
      } else if (errorMessage.includes('permission') || errorMessage.includes('policy')) {
        errorMessage = 'Erro: Sem permissão para criar viagem. Contacte o administrador.';
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorMessage = 'Erro de conexão. Verifique a sua internet e tente novamente.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data da Viagem</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => updateForm('date', e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Motivo da Deslocação *</Label>
              <Input
                id="reason"
                value={formData.reason}
                onChange={(e) => updateForm('reason', e.target.value)}
                placeholder="Ex: Reunião com cliente, Visita técnica..."
              />
              <p className="text-xs text-muted-foreground">
                Descreva brevemente o propósito da viagem
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <OdometerCapture
              label="Foto do Odómetro (Início)"
              value={formData.start_km}
              imageUrl={formData.start_photo_base64}
              onValueChange={(value) => updateForm('start_km', value)}
              onImageChange={(file, base64) => {
                updateForm('start_photo_file', file);
                updateForm('start_photo_base64', base64);
              }}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <OdometerCapture
              label="Foto do Odómetro (Fim)"
              value={formData.end_km}
              imageUrl={formData.end_photo_base64}
              onValueChange={(value) => updateForm('end_km', value)}
              onImageChange={(file, base64) => {
                updateForm('end_photo_file', file);
                updateForm('end_photo_base64', base64);
              }}
            />

            {/* Distance Preview */}
            {formData.start_km && formData.end_km && formData.end_km > formData.start_km && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-muted-foreground">Distância percorrida</p>
                <p className="text-2xl font-bold text-primary">
                  {(formData.end_km - formData.start_km).toLocaleString('pt-PT')} km
                </p>
              </div>
            )}

            {formData.start_km && formData.end_km && formData.end_km <= formData.start_km && (
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm text-yellow-600">
                  Atenção: Km final deve ser maior que o inicial
                </p>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Este passo é opcional. Pode registar apenas o início e adicionar o fim mais tarde.
            </p>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <LocationInput
              label="Local de Partida"
              value={formData.start_location}
              onChange={(value) => updateForm('start_location', value)}
              onCoordinatesChange={(lat, lng) => {
                updateForm('start_lat', lat);
                updateForm('start_lng', lng);
              }}
              placeholder="Ex: Escritório, Lisboa"
            />

            <LocationInput
              label="Local de Chegada"
              value={formData.end_location}
              onChange={(value) => updateForm('end_location', value)}
              onCoordinatesChange={(lat, lng) => {
                updateForm('end_lat', lat);
                updateForm('end_lng', lng);
              }}
              placeholder="Ex: Cliente ABC, Porto"
            />

            <p className="text-xs text-muted-foreground">
              Os locais são opcionais, mas ajudam a contextualizar a viagem.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div
        className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur"
        style={{ borderColor: 'hsl(var(--border))' }}
      >
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate('/dashboard/mapa-kms')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Voltar</span>
          </button>

          <h1 className="font-semibold text-foreground">Nova Viagem</h1>

          <div className="w-16" /> {/* Spacer for alignment */}
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center pb-4 px-4">
          <div className="flex items-center gap-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`w-8 h-0.5 mx-1 ${
                        isCompleted ? 'bg-green-500' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            {STEPS[currentStep - 1].title}
          </h2>
          <p className="text-sm text-muted-foreground">
            Passo {currentStep} de {STEPS.length}
          </p>
        </div>

        {renderStep()}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={isSubmitting}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
          )}

          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed() || isSubmitting}
              className="flex-1"
            >
              Seguinte
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <div className="flex-1 flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleSubmit('draft')}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Guardar Rascunho'
                )}
              </Button>
              <Button
                onClick={() => handleSubmit('completed')}
                disabled={isSubmitting || !formData.start_km}
                className="flex-1"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Concluir
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Quick Submit on Step 2 */}
        {currentStep === 2 && formData.start_km && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
            <p className="text-xs text-muted-foreground mb-2">
              Quer registar apenas o início agora?
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSubmit('draft')}
              disabled={isSubmitting}
            >
              Guardar como rascunho
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Default export para lazy loading
export default NewTrip;
