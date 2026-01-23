import { useState } from 'react';
import { X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../../components/ui/sheet';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { useCreateSandboxActivity } from '../../hooks/useSandboxActivities';
import type { ActivityType, ActivityDirection } from '../../../types/sandbox';

interface QuickLogModalProps {
  leadId: string;
  open: boolean;
  onClose: () => void;
}

const activityTypes: { value: ActivityType; label: string; direction: ActivityDirection }[] = [
  { value: 'call_outbound', label: 'Chamada Saída', direction: 'outbound' },
  { value: 'call_inbound', label: 'Chamada Entrada', direction: 'inbound' },
  { value: 'email_sent', label: 'Email Enviado', direction: 'outbound' },
  { value: 'email_received', label: 'Email Recebido', direction: 'inbound' },
  { value: 'linkedin_connect', label: 'Conexão LinkedIn', direction: 'outbound' },
  { value: 'linkedin_message', label: 'Mensagem LinkedIn', direction: 'outbound' },
  { value: 'meeting', label: 'Reunião', direction: 'neutral' },
  { value: 'note', label: 'Nota', direction: 'neutral' },
];

export function QuickLogModal({ leadId, open, onClose }: QuickLogModalProps) {
  const [type, setType] = useState<ActivityType>('note');
  const [description, setDescription] = useState('');
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  
  const createActivity = useCreateSandboxActivity();

  const selectedActivity = activityTypes.find(a => a.value === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      return;
    }

    try {
      await createActivity.mutateAsync({
        lead_id: leadId,
        type,
        direction: selectedActivity?.direction || 'neutral',
        description: description.trim(),
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      });
      
      setDescription('');
      setMetadata({});
      onClose();
    } catch (error) {
      console.error('Erro ao criar atividade:', error);
    }
  };

  const handleClose = () => {
    setDescription('');
    setMetadata({});
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Registo Rápido de Atividade</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="type">Tipo de Atividade</Label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as ActivityType)}
              className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {activityTypes.map((activity) => (
                <option key={activity.value} value={activity.value}>
                  {activity.label}
                </option>
              ))}
            </select>
          </div>

          {(type === 'email_sent' || type === 'email_received') && (
            <div>
              <Label htmlFor="subject">Assunto (opcional)</Label>
              <Input
                id="subject"
                value={metadata.subject || ''}
                onChange={(e) => setMetadata({ ...metadata, subject: e.target.value })}
                placeholder="Assunto do email"
                className="mt-1"
              />
            </div>
          )}

          {(type === 'call_outbound' || type === 'call_inbound') && (
            <div>
              <Label htmlFor="duration">Duração (minutos, opcional)</Label>
              <Input
                id="duration"
                type="number"
                value={metadata.duration ? metadata.duration / 60 : ''}
                onChange={(e) => 
                  setMetadata({ 
                    ...metadata, 
                    duration: e.target.value ? parseInt(e.target.value) * 60 : undefined 
                  })
                }
                placeholder="Duração em minutos"
                className="mt-1"
              />
            </div>
          )}

          <div>
            <Label htmlFor="description">Descrição *</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a atividade..."
              required
              rows={5}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createActivity.isPending || !description.trim()}
              className="flex-1"
            >
              {createActivity.isPending ? 'A guardar...' : 'Guardar Atividade'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
