import React from 'react';
import { motion } from 'framer-motion';

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  progress: number;
}

export const FormProgress: React.FC<FormProgressProps> = ({ currentStep, totalSteps, progress }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground font-medium tracking-wide uppercase text-xs">
          Passo {currentStep} de {totalSteps}
        </span>
        <span className="text-primary font-bold">
          {Math.round(progress)}%
        </span>
      </div>

      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="h-full bg-primary shadow-sm"
        />
      </div>

      <div className="flex justify-between gap-2">
        {[...Array(totalSteps)].map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i + 1 <= currentStep ? 'bg-primary' : 'bg-secondary'
              }`}
          />
        ))}
      </div>
    </div>
  );
};
