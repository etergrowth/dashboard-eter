import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFinanceAgent } from '@/dashboard/hooks/useFinanceAgent';
import { TEXTS_PT } from '../i18n';
import { Paperclip, Send, Loader2 } from 'lucide-react';
import type { ChatMessage } from '@/types/finance';

interface FinanceChatProps {
  onTransactionExtracted?: (data: any) => void;
  onFileSelect?: () => void;
}

export function FinanceChat({ onTransactionExtracted, onFileSelect }: FinanceChatProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isProcessing, processText, addMessage } = useFinanceAgent();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const text = input.trim();
    setInput('');

    const result = await processText(text);
    if (result && onTransactionExtracted) {
      onTransactionExtracted(result);
    }
  };

  const renderMessage = (message: ChatMessage) => {
    if (message.role === 'assistant') {
      // Mensagens da Carla: texto simples alinhado à esquerda, sem background
      return (
        <div key={message.id} className="flex mb-3">
          <div className="flex-1 max-w-[85%]">
            <div className="text-sm text-foreground/90 leading-relaxed">
              {message.content}
            </div>
          </div>
        </div>
      );
    }

    // Mensagens do utilizador: estilo SMS alinhadas à direita, minimalista
    return (
      <div key={message.id} className="flex mb-3 justify-end">
        <div className="flex-1 max-w-[85%] flex justify-end">
          <div className="text-sm text-foreground text-right leading-relaxed">
            {message.content}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{TEXTS_PT.assistantTitle}</CardTitle>
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
            {TEXTS_PT.assistantBadge}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col p-4 pt-0">
        {/* Área de mensagens */}
        <div className="mb-4 space-y-2 min-h-[300px]">
          {messages.map(renderMessage)}
          {isProcessing && (
            <div className="flex mb-3">
              <div className="flex-1 max-w-[85%]">
                <div className="text-sm text-foreground/70">
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  A processar...
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={TEXTS_PT.inputPlaceholder}
              disabled={isProcessing}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onFileSelect}
              disabled={isProcessing}
              title="Anexar ficheiro"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button type="submit" disabled={isProcessing || !input.trim()}>
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
