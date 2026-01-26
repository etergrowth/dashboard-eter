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
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <SheetHeader className="mb-6 pb-0">
            <SheetTitle className="text-left">Registo Rápido de Atividade</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} id="quick-log-form" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">Tipo de Atividade</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as ActivityType)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {activityTypes.map((activity) => (
                  <option key={activity.value} value={activity.value}>
                    {activity.label}
                  </option>
                ))}
              </select>
            </div>

            {(type === 'email_sent' || type === 'email_received') && (
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium">Assunto (opcional)</Label>
                <Input
                  id="subject"
                  value={metadata.subject || ''}
                  onChange={(e) => setMetadata({ ...metadata, subject: e.target.value })}
                  placeholder="Assunto do email"
                  className="w-full"
                />
              </div>
            )}

            {(type === 'call_outbound' || type === 'call_inbound') && (
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium">Duração (minutos, opcional)</Label>
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
                  className="w-full"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Descrição *</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva a atividade..."
                required
                rows={6}
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none min-h-[120px]"
              />
            </div>
          </form>
        </div>

        <div className="border-t bg-background px-6 py-4">
          <div className="flex gap-3">
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
              form="quick-log-form"
              disabled={createActivity.isPending || !description.trim()}
              className="flex-1"
            >
              {createActivity.isPending ? 'A guardar...' : 'Guardar Atividade'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
