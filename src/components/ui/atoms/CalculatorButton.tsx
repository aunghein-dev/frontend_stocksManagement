// components/calculator/CalculatorButton.tsx
import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CalculatorButtonProps {
  children: ReactNode;
  onClick: () => void;
  isBackspace?: boolean;
  isClear?: boolean; // Added for specific clear button styling
  disabled?: boolean;
}

const CalculatorButton: React.FC<CalculatorButtonProps> = ({ children, onClick, isBackspace = false, isClear = false, disabled }) => {
  return (
    <motion.button
      className={`
        w-full rounded-sm text-gray-900 text-xl font-semibold
        flex items-center justify-center py-5 cursor-pointer
        transition-all duration-200 ease-in-out outline-none
        ${isBackspace ? 'bg-gray-50 hover:bg-gray-100 text-gray-700' :
          isClear ? 'bg-gray-100 hover:bg-gray-200 text-gray-800' : // Distinct style for clear
          'bg-gray-50 hover:bg-gray-100'}
      `}
      disabled={disabled}
      onClick={onClick}
      whileTap={{ scale: 0.95 }} // Visual feedback on tap/click
      aria-label={typeof children === 'string' ? children : 'Backspace'} // Accessibility
    >
      {children}
    </motion.button>
  );
};

export default CalculatorButton;