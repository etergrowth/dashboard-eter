import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

interface ChatInterfaceProps {
    onAddAddress: (address: string) => Promise<any>;
    isProcessing: boolean;
}

export function ChatInterface({ onAddAddress, isProcessing }: ChatInterfaceProps) {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Olá! Eu sou o seu assistente de rotas. Diga-me onde quer ir ou cole uma lista de moradas.',
            sender: 'bot',
            timestamp: new Date(),
        },
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isProcessing) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');

        // Simple "AI" logic: assume input is an address for now
        // In a real scenario, we would send this to an LLM to parse intent
        try {
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    text: 'A processar morada...',
                    sender: 'bot',
                    timestamp: new Date(),
                },
            ]);

            await onAddAddress(userMessage.text);

            setMessages((prev) => {
                const newMessages = [...prev];
                newMessages.pop(); // Remove "Processing..."
                return [
                    ...newMessages,
                    {
                        id: (Date.now() + 2).toString(),
                        text: `Adicionei "${userMessage.text}" à rota.`,
                        sender: 'bot',
                        timestamp: new Date(),
                    },
                ];
            });
        } catch (error) {
            setMessages((prev) => {
                const newMessages = [...prev];
                newMessages.pop();
                return [
                    ...newMessages,
                    {
                        id: (Date.now() + 2).toString(),
                        text: 'Desculpe, não consegui encontrar essa morada. Tente ser mais específico.',
                        sender: 'bot',
                        timestamp: new Date(),
                    },
                ];
            });
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#111827] rounded-xl overflow-hidden border border-white/10">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-[#1A1F2C] flex items-center gap-2">
                <div className="p-2 bg-[#7BA8F9]/20 rounded-lg">
                    <Bot className="w-5 h-5 text-[#7BA8F9]" />
                </div>
                <div>
                    <h3 className="text-white font-medium">Assistente de Rotas</h3>
                    <p className="text-xs text-green-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                        Online
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''
                            }`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-[#7BA8F9]' : 'bg-[#1A1F2C] border border-white/10'
                                }`}
                        >
                            {msg.sender === 'user' ? (
                                <User className="w-4 h-4 text-white" />
                            ) : (
                                <Bot className="w-4 h-4 text-[#7BA8F9]" />
                            )}
                        </div>
                        <div
                            className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user'
                                ? 'bg-[#7BA8F9] text-white rounded-tr-none'
                                : 'bg-[#1A1F2C] text-gray-300 border border-white/10 rounded-tl-none'
                                }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-[#1A1F2C] border-t border-white/10">
                <form onSubmit={handleSend} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Escreva uma morada..."
                        className="w-full pl-4 pr-12 py-3 bg-[#111827] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7BA8F9] focus:border-transparent"
                        disabled={isProcessing}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isProcessing}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#7BA8F9] hover:bg-[#6092eb] rounded-lg text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
