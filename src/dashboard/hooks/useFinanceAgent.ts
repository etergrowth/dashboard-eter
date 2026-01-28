import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { TEXTS_PT } from '../../dashboard/pages/Finance/i18n';
import type { ChatMessage, DadosExtraidosAI, ProcessTransactionResponse } from '../../types/finance';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Helper to call OpenAI via Edge Function (keeps API key server-side)
async function callOpenAIProxy(messages: Array<{role: string; content: any}>, options?: {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Utilizador não autenticado');
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/openai-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      action: 'chat',
      messages,
      model: options?.model || 'gpt-4o-mini',
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 500,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || 'Erro ao chamar OpenAI API');
  }

  return response.json();
}

export function useFinanceAgent() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: TEXTS_PT.agentWelcome,
      timestamp: new Date(),
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage.id;
  }, []);

  const processText = useCallback(async (text: string): Promise<DadosExtraidosAI | null> => {
    if (!text.trim()) return null;

    setIsProcessing(true);

    try {
      // Adicionar mensagem do utilizador
      addMessage({ role: 'user', content: text });

      const today = new Date().toISOString().split('T')[0];
      const systemPrompt = `Você é um assistente financeiro que fala português de Portugal. Extraia informações de transações financeiras.

Retorne APENAS um JSON válido com:
{
  "tipo": "despesa" | "receita",
  "valor": number,
  "moeda": "EUR",
  "data": "YYYY-MM-DD",
  "comerciante": string,
  "descricao": string,
  "categoria": string,
  "confianca": number (0-1)
}

Categorias: software_saas, viagens, refeicoes, material_escritorio, receitas, subscricoes, servicos_publicos, marketing, servicos_profissionais, outro.

Data atual: ${today}`;

      // Call OpenAI via Edge Function (API key stays server-side)
      const data = await callOpenAIProxy([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ]);

      const aiResponse = data.choices[0]?.message?.content || '';

      // Parse JSON da resposta
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Resposta inválida da AI');
      }

      const extractedData = JSON.parse(jsonMatch[0]);

      // Adicionar resposta do agent
      addMessage({
        role: 'assistant',
        content: 'Compreendido. Extraí os seguintes detalhes. Por favor, reveja-os no painel de pré-visualização à direita.',
      });

      return extractedData;
    } catch (error: any) {
      console.error('Erro ao processar texto:', error);
      addMessage({
        role: 'assistant',
        content: `Desculpe, não consegui processar essa informação. ${error.message || 'Pode reformular ou fornecer mais detalhes?'}`,
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [addMessage]);

  const processImage = useCallback(async (
    imageBase64: string,
    mimeType: string,
    filename: string
  ): Promise<DadosExtraidosAI | null> => {
    setIsProcessing(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const systemPrompt = `Você é um assistente financeiro que fala português de Portugal. Extraia informações de faturas/recibos.

Retorne APENAS um JSON válido com:
{
  "tipo": "despesa" | "receita",
  "valor": number,
  "moeda": "EUR",
  "data": "YYYY-MM-DD",
  "comerciante": string,
  "descricao": string,
  "categoria": string,
  "confianca": number (0-1)
}

Categorias: software_saas, viagens, refeicoes, material_escritorio, receitas, subscricoes, servicos_publicos, marketing, servicos_profissionais, outro.

Data atual: ${today}`;

      // Call OpenAI Vision via Edge Function (API key stays server-side)
      const data = await callOpenAIProxy([
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`
              }
            },
            {
              type: 'text',
              text: 'Extraia os detalhes desta fatura/recibo.'
            }
          ]
        }
      ]);

      const aiResponse = data.choices[0]?.message?.content || '';

      // Parse JSON da resposta
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Resposta inválida da AI');
      }

      const extractedData = JSON.parse(jsonMatch[0]);
      const { comerciante, valor, data: dataTransacao } = extractedData;

      // Adicionar resposta do agent
      addMessage({
        role: 'assistant',
        content: `Processei o seu recibo de ${comerciante || 'comerciante desconhecido'}. Encontrei um total de ${valor.toFixed(2)}€ com data de ${dataTransacao}. Por favor, verifique os detalhes no painel de pré-visualização.`,
      });

      return extractedData;
    } catch (error: any) {
      console.error('Erro ao processar imagem:', error);
      addMessage({
        role: 'assistant',
        content: `Desculpe, não consegui processar esse recibo. ${error.message || 'Tente novamente ou carregue uma imagem mais clara.'}`,
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [addMessage]);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: TEXTS_PT.agentWelcome,
        timestamp: new Date(),
      },
    ]);
  }, []);

  return {
    messages,
    isProcessing,
    processText,
    processImage,
    addMessage,
    clearMessages,
  };
}
