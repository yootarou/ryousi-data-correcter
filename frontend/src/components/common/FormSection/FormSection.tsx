import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FormSectionProps } from './FormSection.types';

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  children,
  defaultOpen = true,
  collapsible = true,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`card ${className}`}>
      <button
        type="button"
        onClick={() => collapsible && setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between w-full text-left
          ${collapsible ? 'cursor-pointer' : 'cursor-default'}
        `}
      >
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        {collapsible && (
          <motion.svg
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </motion.svg>
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
