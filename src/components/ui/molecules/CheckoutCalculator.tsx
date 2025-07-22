// components/CheckoutCalculator.tsx
"use client";

import React, { useCallback, useMemo } from 'react';
import { MdBackspace } from "react-icons/md";
import formatMoney from "@/components/utils/formatMoney"; // Adjust path if necessary

import { motion } from 'framer-motion';
import CalculatorButton from '../atoms/CalculatorButton';
import { useTranslation } from '@/hooks/useTranslation';

// Define props interface for CheckoutCalculator
interface CheckoutCalculatorProps {
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  disabled?: boolean;
  handlePayNow: () => void;
  loading?: boolean;
}

export default function CheckoutCalculator({ inputValue, setInputValue, disabled, handlePayNow, loading }: CheckoutCalculatorProps) {
  // inputValue and setInputValue are now received via props

  const calcButtons = useMemo(() => ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'], []);
  const suggestionAmounts = useMemo(() => [100, 500, 1000, 5000, 10000, 50000, 100000, 500000], []);
  const {t} = useTranslation();

  // Adjust font size dynamically based on input length
  const inputFontSizeClass = useMemo(() => {
    if (inputValue.length > 12) return 'text-lg';
    if (inputValue.length > 9) return 'text-xl';
    return 'text-2xl';
  }, [inputValue]);

  // Handle direct typing into the input field
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;

    value = value.replace(/[^0-9.]/g, '');

    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    setInputValue(value); // Use the setter from props
  }, [setInputValue]);

  // Handle number/decimal button clicks
  const handleDigitClick = useCallback((digit: string) => {
    setInputValue(prev => {
      if (digit === '.' && prev.includes('.')) return prev;
      if (prev === '0' && digit !== '.') return digit;
      return prev + digit;
    });
  }, [setInputValue]);

  // Handle backspace button click or keyboard 'Backspace'
  const handleBackspace = useCallback(() => {
    setInputValue(prev => prev.slice(0, -1));
  }, [setInputValue]);

  // Handle clear button click or keyboard 'Delete'
  const handleClear = useCallback(() => {
    setInputValue('');
  }, [setInputValue]);

  // Handle suggestion button clicks
  const handleSuggestionClick = useCallback((amount: number) => {
    const currentNum = parseFloat(inputValue || '0');
    const newTotal = currentNum + amount;
    setInputValue(newTotal.toString());
  }, [inputValue, setInputValue]);

 

  // --- Keyboard Event Handler for the entire calculator area ---
  const handleGlobalKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    const { key, target } = event;

    if ((target as HTMLElement).tagName === 'INPUT') {
      if (key === 'Enter') {
        handlePayNow();
        event.preventDefault();
      }
      if (key === 'Delete') {
        handleClear();
        event.preventDefault();
      }
      return;
    }

    if (calcButtons.includes(key)) {
      handleDigitClick(key);
      event.preventDefault();
    } else if (key === 'Backspace') {
      handleBackspace();
      event.preventDefault();
    } else if (key === 'Delete') {
      handleClear();
      event.preventDefault();
    } else if (key === 'Enter') {
      handlePayNow();
      event.preventDefault();
    }
  }, [handleDigitClick, handleBackspace, handleClear, handlePayNow, calcButtons]);

  return (
    <div
      className="w-full h-full flex flex-col gap-3 px-2 py-2 justify-between"
      tabIndex={0}
      onKeyDown={handleGlobalKeyDown}
    >
      {/* Input Display */}
      <div className=" bg-blue-50 border border-blue-200 rounded-xl">
        <input
          type="text"
          value={inputValue === '' ? '' : inputValue}
          onChange={handleInputChange}
          className={`
            w-full border-none px-3 min-h-[60px] max-h-[60px] text-right
            bg-transparent outline-none appearance-none
            ${inputValue === '' ? 'text-gray-400' : 'text-gray-900'}
            ${inputFontSizeClass}
          `}
          placeholder="0"
        />
      </div>

      {/* Suggestion Buttons */}
      <div className="flex flex-row gap-2 overflow-x-auto custom-scrollbar min-h-[50px] pb-3">
        {suggestionAmounts.map((amount, index) => (
          <motion.button
            key={index}
            className="flex-shrink-0 bg-gray-50 px-4 py-2 rounded-xl text-md
                       cursor-pointer hover:bg-gray-100 transition-all duration-200 ease-in-out font-medium
                       border border-gray-200"
            onClick={() => handleSuggestionClick(amount)}
            disabled={disabled}
            whileTap={{ scale: 0.95 }}
            aria-label={`Add ${formatMoney(amount)}`}
          >
            {formatMoney(amount)}
          </motion.button>
        ))}
      </div>

      {/* Calculator Grid */}
      <div className='flex flex-col gap-2'>
        <div className="grid grid-cols-3 gap-x-1 gap-y-2">
          {calcButtons.map((item) => (
            <CalculatorButton 
              key={item} 
              onClick={() => handleDigitClick(item)}
              disabled={disabled}>
              {item}
            </CalculatorButton>
          ))}
          <CalculatorButton onClick={handleBackspace} isBackspace={true}>
            <MdBackspace size={24} />
          </CalculatorButton>
        </div>
        <CalculatorButton onClick={handleClear} isClear={true}>
          <span className='text-[1.1rem]'>{t("btnTxt_clear")}</span>
        </CalculatorButton>
      </div>

      {/* Pay Now Button */}
      <motion.button
        className={`${loading? "bg-gray-300 ": "bg-blue-500 "}text-sm text-white rounded-xl py-3 px-4 w-full
                   cursor-pointer hover:bg-blue-600 transition-all duration-200 ease-in-out font-semibold`}
        onClick={handlePayNow}
        disabled={loading}
        whileTap={{ scale: 0.98 }}
      >
        {loading ?  (<div className='flex items-center justify-center gap-2'><div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" /> {t("btnTxt_processing")}</div>)  : t("btnTxt_payNow")}
      </motion.button>
    </div>
  );
}