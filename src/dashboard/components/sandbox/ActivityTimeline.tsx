import { 
  Phone, 
  Mail, 
  Linkedin, 
  Calendar, 
  FileText, 
  Plus,
  Clock,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import type { SandboxActivity, ActivityType } from '../../../types/sandbox';

interface ActivityTimelineProps {
  activities: SandboxActivity[];
  onAddActivity: () => void;
}

const activityIcons: Record<ActivityType, typeof Phone> = {
  call_outbound: Phone,
  call_inbound: Phone,
  email_sent: Mail,
  email_received: Mail,
  linkedin_connect: Linkedin,
  linkedin_message: Linkedin,
  meeting: Calendar,
  note: FileText,
  lead_imported: FileText,
};

const activityLabels: Record<ActivityType, string> = {
  call_outbound: 'Chamada Saída',
  call_inbound: 'Chamada Entrada',
  email_sent: 'Email Enviado',
  email_received: 'Email Recebido',
  linkedin_connect: 'Conexão LinkedIn',
  linkedin_message: 'Mensagem LinkedIn',
  meeting: 'Reunião',
  note: 'Nota',
  lead_imported: 'Lead Importada',
};

export function ActivityTimeline({ activities, onAddActivity }: ActivityTimelineProps) {
  // Agrupar atividades por data
  const groupedActivities = activities.reduce((acc, activity) => {
    const date = format(new Date(activity.timestamp), 'yyyy-MM-dd', { locale: pt });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, SandboxActivity[]>);

  const sortedDates = Object.keys(groupedActivities).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <Card className="border border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Histórico de Atividades</CardTitle>
          <Button variant="outline" size="sm" onClick={onAddActivity}>
            <Plus size={16} className="mr-2" />
            Adicionar Atividade
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma atividade registada</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => {
              const dayActivities = groupedActivities[date];
              const formattedDate = format(new Date(date), "d 'de' MMMM, yyyy", { locale: pt });
              
              return (
                <div key={date} className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      {formattedDate}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  
                  {dayActivities.map((activity) => {
                    const Icon = activityIcons[activity.type];
                    const label = activityLabels[activity.type];
                    const DirectionIcon = activity.direction === 'inbound' ? ArrowDown : ArrowUp;
                    
                    return (
                      <div
                        key={activity.id}
                        className="flex gap-4 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${
                          activity.direction === 'inbound' 
                            ? 'bg-green-500/10 text-green-500' 
                            : activity.direction === 'outbound'
                            ? 'bg-blue-500/10 text-blue-500'
                            : 'bg-gray-500/10 text-gray-500'
                        }`}>
                          <Icon size={18} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-foreground">{label}</span>
                            <DirectionIcon 
                              size={12} 
                              className={
                                activity.direction === 'inbound' 
                                  ? 'text-green-500' 
                                  : 'text-blue-500'
                              } 
                            />
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock size={12} />
                              {format(new Date(activity.timestamp), 'HH:mm', { locale: pt })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              {activity.metadata.duration && (
                                <span>Duração: {Math.round(activity.metadata.duration / 60)}min</span>
                              )}
                              {activity.metadata.subject && (
                                <span>Assunto: {activity.metadata.subject}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
