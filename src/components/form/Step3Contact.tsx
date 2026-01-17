import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Building2, CheckSquare, Square } from 'lucide-react';

interface StepProps {
    data: any;
    errors: any;
    onUpdate: (data: any) => void;
}

export const Step3Contact: React.FC<StepProps> = ({ data, errors, onUpdate }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
        >
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                    Vamos conversar!
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    Já conhecemos o seu desafio. Como prefere que entremos em contacto?
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Nome */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <User size={12} className="text-primary" />
                        Nome Completo <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={data.firstName || ''}
                        onChange={(e) => onUpdate({ firstName: e.target.value })}
                        placeholder="Seu nome"
                        className={`w-full bg-secondary border border-border text-foreground px-4 py-3 rounded-xl transition-all outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.firstName ? 'border-red-500/50' : 'hover:border-border/50'
                            }`}
                    />
                    {errors.firstName && <p className="text-[10px] text-red-400 font-medium">{errors.firstName}</p>}
                </div>

                {/* Empresa */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Building2 size={12} className="text-primary" />
                        Empresa
                    </label>
                    <input
                        type="text"
                        value={data.empresa || ''}
                        onChange={(e) => onUpdate({ empresa: e.target.value })}
                        placeholder="Nome da empresa"
                        className="w-full bg-secondary border border-border text-foreground px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-border/50"
                    />
                </div>

                {/* Email */}
                <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Mail size={12} className="text-primary" />
                        Email Profissional <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        value={data.email || ''}
                        onChange={(e) => onUpdate({ email: e.target.value })}
                        placeholder="exemplo@empresa.com"
                        className={`w-full bg-secondary border border-border text-foreground px-4 py-3 rounded-xl transition-all outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.email ? 'border-red-500/50' : 'hover:border-border/50'
                            }`}
                    />
                    {errors.email && <p className="text-[10px] text-red-400 font-medium">{errors.email}</p>}
                </div>

                {/* Telefone */}
                <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Phone size={12} className="text-primary" />
                        Telefone
                    </label>
                    <input
                        type="tel"
                        value={data.phone || ''}
                        onChange={(e) => onUpdate({ phone: e.target.value })}
                        placeholder="+351 XXX XXX XXX"
                        className="w-full bg-secondary border border-border text-foreground px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-border/50"
                    />
                </div>

                {/* Consentimento */}
                <div className="col-span-2 pt-4">
                    <button
                        type="button"
                        onClick={() => onUpdate({ privacyConsent: !data.privacyConsent })}
                        className="flex items-start gap-3 group cursor-pointer text-left"
                    >
                        <div className={`mt-0.5 p-0.5 rounded transition-colors ${data.privacyConsent ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                            {data.privacyConsent ? <CheckSquare size={18} /> : <Square size={18} />}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                            Aceito a <a href="#" className="text-primary underline underline-offset-2 hover:text-[#FF8A6B]">política de privacidade</a> e autorizo o contacto para fins comerciais da Eter Growth.
                        </p>
                    </button>
                    {errors.privacyConsent && <p className="text-[10px] text-red-400 mt-2 font-medium">{errors.privacyConsent}</p>}
                </div>
            </div>

            <div className="flex items-center gap-2 bg-secondary p-4 rounded-xl border border-border">
                <span className="text-lg">⏱️</span>
                <p className="text-xs text-muted-foreground">
                    <span className="text-foreground font-bold">Tempo médio de resposta:</span> 4 horas úteis
                </p>
            </div>
        </motion.div>
    );
};
