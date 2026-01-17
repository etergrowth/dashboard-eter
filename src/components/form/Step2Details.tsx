import React from 'react';
import { motion } from 'framer-motion';
import { Target, Banknote, MapPin } from 'lucide-react';

interface StepProps {
    data: any;
    errors: any;
    onUpdate: (data: any) => void;
}

export const Step2Details: React.FC<StepProps> = ({ data, errors, onUpdate }) => {
    const projectTypes = [
        "Automação de CRM",
        "AI Operations",
        "Compliance Automático",
        "Web Design de Alta Conversão",
        "Consultoria Estratégica",
        "Outro"
    ];

    const budgetRanges = [
        "< 5.000€",
        "5.000€ - 15.000€",
        "15.000€ - 50.000€",
        "50.000€ - 100.000€",
        "> 100.000€",
        "Ainda não sei"
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
        >
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                    Detalhes do Projeto
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    Ajude-nos a entender a escala e o tipo de solução que procura.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tipo de Projeto */}
                <div className="space-y-2 col-span-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Target size={14} className="text-primary" />
                        Tipo de Projeto <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={data.projectType || ''}
                        onChange={(e) => onUpdate({ projectType: e.target.value })}
                        className={`w-full bg-secondary border border-border text-foreground px-4 py-3.5 rounded-xl transition-all outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none ${errors.projectType ? 'border-red-500/50' : 'hover:border-border/50'
                            }`}
                    >
                        <option value="" disabled className="bg-white">Selecione uma opção</option>
                        {projectTypes.map(type => (
                            <option key={type} value={type} className="bg-white">{type}</option>
                        ))}
                    </select>
                    {errors.projectType && (
                        <p className="text-xs text-red-400 mt-1 pl-1 font-medium">{errors.projectType}</p>
                    )}
                </div>

                {/* Orçamento */}
                <div className="space-y-2 col-span-2 md:col-span-1">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Banknote size={14} className="text-primary" />
                        Orçamento <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={data.budget || ''}
                        onChange={(e) => onUpdate({ budget: e.target.value })}
                        className={`w-full bg-secondary border border-border text-foreground px-4 py-3.5 rounded-xl transition-all outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none ${errors.budget ? 'border-red-500/50' : 'hover:border-border/50'
                            }`}
                    >
                        <option value="" disabled className="bg-white">Selecione o Budget</option>
                        {budgetRanges.map(range => (
                            <option key={range} value={range} className="bg-white">{range}</option>
                        ))}
                    </select>
                    {errors.budget && (
                        <p className="text-xs text-red-400 mt-1 pl-1 font-medium">{errors.budget}</p>
                    )}
                </div>

                {/* Localização */}
                <div className="space-y-2 col-span-2 md:col-span-1">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <MapPin size={14} className="text-primary" />
                        Localização <span className="text-muted-foreground">(Opcional)</span>
                    </label>
                    <input
                        type="text"
                        value={data.location || ''}
                        onChange={(e) => onUpdate({ location: e.target.value })}
                        placeholder="Ex: Lisboa, Portugal"
                        className="w-full bg-secondary border border-border text-foreground px-4 py-3.5 rounded-xl transition-all outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-border/50"
                    />
                </div>
            </div>
        </motion.div>
    );
};
