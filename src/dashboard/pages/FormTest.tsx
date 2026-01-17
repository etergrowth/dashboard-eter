import React, { useState } from 'react';
import { MultiStepForm } from '../../components/form/MultiStepForm';

export const FormTest: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="min-h-[400px] flex flex-col items-center justify-center space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-white">Teste do Formulário Multistep</h1>
                <p className="text-gray-400">Clique no botão abaixo para abrir o novo fluxo de lead capture.</p>
            </div>

            <button
                onClick={() => setIsOpen(true)}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-indigo-500/20"
            >
                ✨ Abrir Formulário
            </button>

            {isOpen && (
                <MultiStepForm onClose={() => setIsOpen(false)} />
            )}
        </div>
    );
};
