import { useState, useEffect } from 'react';
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { MessageCircle, X } from 'lucide-react';
import { getChatKitSessionToken } from '../utils/chatkit';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);

  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        if (existing) {
          return existing;
        }
        return await getChatKitSessionToken();
      },
    },
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setIsMinimized(true);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const toggleChat = () => {
    if (isMinimized) {
      setIsMinimized(false);
      setIsOpen(true);
    } else {
      setIsMinimized(true);
      setIsOpen(false);
    }
  };

  return (
    <>
      <div
        className={`fixed bottom-6 right-6 z-[9999] transition-all duration-300 ease-out ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-[#7BA8F9] to-[#3C64B1] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Chat Assistente</h3>
                <p className="text-white/80 text-xs">Estamos aqui para ajudar</p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
              aria-label="Fechar chat"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="h-[500px] w-[380px]">
            <ChatKit control={control} className="h-full w-full" />
          </div>
        </div>
      </div>

      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 z-[9998] transition-all duration-300 ${
          isMinimized ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'
        }`}
        aria-label="Abrir chat"
      >
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-r from-[#7BA8F9] to-[#3C64B1] rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center hover:scale-110 group">
            <MessageCircle className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>

          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
        </div>
      </button>
    </>
  );
}
