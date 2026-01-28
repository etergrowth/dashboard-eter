import { Mail, Send, User, FileText } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../../components/ui/sheet';
import { Button } from '../../../components/ui/button';

interface EmailPreviewModalProps {
  open: boolean;
  onClose: () => void;
  onSend: () => void;
  isSending: boolean;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  htmlContent: string;
}

export function EmailPreviewModal({
  open,
  onClose,
  onSend,
  isSending,
  recipientEmail,
  recipientName,
  subject,
  htmlContent,
}: EmailPreviewModalProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-0">
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <SheetHeader className="mb-6 pb-0">
            <SheetTitle className="text-left flex items-center gap-2">
              <Mail size={20} />
              Pré-visualização do Email
            </SheetTitle>
          </SheetHeader>

          {/* Email Info */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/30">
              <User size={16} className="text-muted-foreground" />
              <div className="flex-1">
                <span className="text-xs text-muted-foreground block">Destinatário</span>
                <span className="text-sm font-medium">{recipientName}</span>
                <span className="text-sm text-muted-foreground ml-2">({recipientEmail})</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/30">
              <FileText size={16} className="text-muted-foreground" />
              <div className="flex-1">
                <span className="text-xs text-muted-foreground block">Assunto</span>
                <span className="text-sm font-medium">{subject}</span>
              </div>
            </div>
          </div>

          {/* Email Preview */}
          <div className="border border-border rounded-lg overflow-hidden bg-white">
            <div className="p-2 bg-secondary/50 border-b border-border">
              <span className="text-xs text-muted-foreground">Pré-visualização</span>
            </div>
            <iframe
              srcDoc={htmlContent}
              title="Email Preview"
              className="w-full h-[500px] border-0"
              sandbox="allow-same-origin"
            />
          </div>
        </div>

        <div className="border-t bg-background px-6 pt-[10px] pb-4 flex items-center justify-center min-h-[72px]">
          <div className="flex gap-3 w-full max-w-md items-center justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSending}
            >
              Cancelar
            </Button>
            <Button
              onClick={onSend}
              disabled={isSending}
              className="flex-1"
            >
              {isSending ? (
                'A enviar...'
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Enviar Email
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
