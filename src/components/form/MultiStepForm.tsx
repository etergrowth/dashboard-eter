import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { FormProgress } from './FormProgress';
import { Step1Challenge } from './Step1Challenge';
import { Step2Details } from './Step2Details';
import { Step3Contact } from './Step3Contact';
import { submitLead, type LeadFormData } from '../../lib/supabase';

interface MultiStepFormProps {
    onClose: () => void;
}

type ValidationErrors = Partial<Record<keyof LeadFormData, string>>;

export const MultiStepForm: React.FC<MultiStepFormProps> = ({ onClose }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState<Partial<LeadFormData>>({
        privacyConsent: false,
    });
    const [errors, setErrors] = useState<ValidationErrors>({});

    const validateStep1 = () => {
        const newErrors: ValidationErrors = {};
        if (!formData.assunto || formData.assunto.length < 5) {
            newErrors.assunto = 'O assunto deve ter pelo menos 5 caracteres';
        }
        if (!formData.mensagem || formData.mensagem.length < 50) {
            newErrors.mensagem = 'Descreva o seu desafio com pelo menos 50 caracteres';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: ValidationErrors = {};
        if (!formData.projectType) newErrors.projectType = 'Selecione um tipo de projeto';
        if (!formData.budget) newErrors.budget = 'Selecione uma faixa de orçamento';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors: ValidationErrors = {};
        if (!formData.firstName || formData.firstName.length < 2) {
            newErrors.firstName = 'Por favor, indique o seu nome completo';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            newErrors.email = 'Email inválido. Use um email profissional';
        }
        if (!formData.privacyConsent) {
            newErrors.privacyConsent = 'É necessário aceitar a política de privacidade';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        let isValid = false;
        if (currentStep === 1) isValid = validateStep1();
        if (currentStep === 2) isValid = validateStep2();
        if (currentStep === 3) isValid = validateStep3();

        if (isValid) {
            if (currentStep < 3) {
                setCurrentStep(prev => prev + 1);
                setErrors({});
            } else {
                handleSubmit();
            }
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
            setErrors({});
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const result = await submitLead(formData as LeadFormData);
            if (result.success) {
                setIsSuccess(true);
                setTimeout(() => {
                    onClose();
                }, 4000);
            } else {
                alert('Erro: ' + (result.error || 'Falha ao enviar'));
            }
        } catch (err) {
            console.error(err);
            alert('Erro inesperado ao enviar o formulário.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateFormData = (data: Partial<LeadFormData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const progress = (currentStep / 3) * 100;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 pointer-events-auto">
            {/* Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white border border-border w-full max-w-2xl h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="px-6 py-6 sm:px-10 sm:py-8 border-b border-border bg-secondary/50">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-tr from-[#FF6B4A] to-[#FF8A6B] rounded-lg flex items-center justify-center shadow-lg shadow-[#FF6B4A]/20">
                                <span className="text-white font-bold text-lg">E</span>
                            </div>
                            <h2 className="text-xl font-bold text-foreground tracking-tight">etergrowth</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <FormProgress currentStep={currentStep} totalSteps={3} progress={progress} />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 sm:py-10">
                    <AnimatePresence mode="wait">
                        {isSuccess ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-full flex flex-col items-center justify-center text-center space-y-6 py-10"
                            >
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                                    <CheckCircle2 size={40} className="text-emerald-500" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-foreground">Submetido com Sucesso!</h3>
                                    <p className="text-muted-foreground max-w-xs mx-auto text-sm leading-relaxed">
                                        Receberá um email em breve com os próximos passos. A nossa equipa entrará em contacto em até 4 horas úteis.
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 bg-secondary hover:bg-accent text-foreground rounded-lg transition-colors text-sm font-medium border border-border"
                                >
                                    Fechar Janela
                                </button>
                            </motion.div>
                        ) : (
                            <div key="form-steps">
                                {currentStep === 1 && (
                                    <Step1Challenge
                                        data={formData}
                                        errors={errors}
                                        onUpdate={updateFormData}
                                    />
                                )}
                                {currentStep === 2 && (
                                    <Step2Details
                                        data={formData}
                                        errors={errors}
                                        onUpdate={updateFormData}
                                    />
                                )}
                                {currentStep === 3 && (
                                    <Step3Contact
                                        data={formData}
                                        errors={errors}
                                        onUpdate={updateFormData}
                                    />
                                )}
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                {!isSuccess && (
                    <div className="px-6 py-6 sm:px-10 sm:py-8 border-t border-border bg-secondary/50 flex items-center justify-between gap-4">
                        {currentStep > 1 ? (
                            <button
                                onClick={handlePrev}
                                className="flex items-center gap-2 px-6 py-3 text-muted-foreground hover:text-foreground font-semibold transition-colors"
                                disabled={isSubmitting}
                            >
                                <ArrowLeft size={18} />
                                <span>Voltar</span>
                            </button>
                        ) : (
                            <div />
                        )}

                        <button
                            onClick={handleNext}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-bold rounded-2xl hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:scale-100"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    <span>A PROCESSAR...</span>
                                </>
                            ) : (
                                <>
                                    <span>{currentStep === 3 ? 'Agendar Reunião' : 'Continuar'}</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};
