import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { TEXTS_PT } from '../../dashboard/pages/Finance/i18n';
import type { ChatMessage, DadosExtraidosAI, ProcessTransactionResponse } from '../../types/finance';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

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

      // Usar OpenAI diretamente
      const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
      if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY não configurada');
      }

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

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao chamar OpenAI API');
      }

      const data = await response.json();
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
      // Usar OpenAI Vision
      const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
      if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY não configurada');
      }

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

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
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
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao chamar OpenAI API');
      }

      const data = await response.json();
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
