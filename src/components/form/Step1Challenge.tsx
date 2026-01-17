import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface StepProps {
    data: any;
    errors: any;
    onUpdate: (data: any) => void;
}

export const Step1Challenge: React.FC<StepProps> = ({ data, errors, onUpdate }) => {
    const [isImproving, setIsImproving] = useState(false);
    const charCount = data.mensagem?.length || 0;

    const handleImproveWithAI = async () => {
        if (!data.mensagem || data.mensagem.length < 20) {
            alert('Escreva pelo menos 20 caracteres para melhorar com IA');
            return;
        }

        setIsImproving(true);

        try {
            const { data: aiResult, error } = await supabase.functions.invoke('improve-text', {
                body: { text: data.mensagem }
            });

            if (error) throw error;
            onUpdate({ mensagem: aiResult.improvedText });
        } catch (error) {
            console.error('AI error:', error);
            // Fallback para simulação se o endpoint não existir no dashboard localmente
            if (import.meta.env.DEV) {
                setTimeout(() => {
                    onUpdate({ mensagem: data.mensagem + " [Texto melhorado pelo sistema - verifique se a Edge Function está implantada]" });
                    setIsImproving(false);
                }, 1500);
                return;
            }
        } finally {
            setIsImproving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
        >
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                    Qual é o seu desafio?
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    Explique-nos o problema que quer resolver. A nossa equipa de especialistas irá analisar o seu caso.
                </p>
            </div>

            <div className="space-y-6">
                {/* Assunto */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        Título do Desafio <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                        <input
                            type="text"
                            value={data.assunto || ''}
                            onChange={(e) => onUpdate({ assunto: e.target.value })}
                            placeholder="Ex: Automatizar workflow de orçamentação"
                            className={`w-full bg-secondary border border-border text-foreground px-4 py-3.5 rounded-xl transition-all outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.assunto ? 'border-red-500/50 bg-red-500/5' : 'hover:border-border/50'
                                }`}
                        />
                        {errors.assunto && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                                <AlertCircle size={18} />
                            </div>
                        )}
                    </div>
                    {errors.assunto && (
                        <p className="text-xs text-red-400 mt-1 pl-1 font-medium">{errors.assunto}</p>
                    )}
                </div>

                {/* Mensagem */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                        <span>Descrição detalhada <span className="text-red-500">*</span></span>
                        <span className={`text-[10px] font-mono ${charCount < 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {charCount}/50 min
                        </span>
                    </label>
                    <div className="relative">
                        <textarea
                            value={data.mensagem || ''}
                            onChange={(e) => onUpdate({ mensagem: e.target.value })}
                            rows={6}
                            placeholder="Descreva aqui o seu processo atual e os pontos de dor que gostaria de transformar..."
                            className={`w-full bg-secondary border border-border text-foreground px-4 py-3.5 rounded-xl transition-all outline-none resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.mensagem ? 'border-red-500/50 bg-red-500/5' : 'hover:border-border/50'
                                }`}
                        />

                        {/* Botão IA */}
                        <div className="absolute right-3 bottom-3">
                            <button
                                type="button"
                                onClick={handleImproveWithAI}
                                disabled={isImproving || !data.mensagem || data.mensagem.length < 20}
                                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white text-[11px] font-bold rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed shadow-lg border border-white/10"
                            >
                                {isImproving ? (
                                    <>
                                        <Loader2 className="animate-spin" size={12} />
                                        <span>A OTIMIZAR...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={12} />
                                        <span>MELHORAR COM IA</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    {errors.mensagem && (
                        <p className="text-xs text-red-400 mt-1 pl-1 font-medium">{errors.mensagem}</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
