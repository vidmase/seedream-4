
import React, { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  helperText?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, id, icon, helperText, error, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
        {icon && <span className="text-primary-400">{icon}</span>}
        {label}
      </label>
      <div className="relative group">
        <input
          id={id}
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={`w-full bg-gray-800/50 backdrop-blur-sm border-2 text-white rounded-xl p-4 transition-all duration-300 outline-none placeholder-gray-400 ${
            error 
              ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
              : isFocused
                ? 'border-primary-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 shadow-lg shadow-primary-500/10'
                : 'border-gray-600 hover:border-gray-500'
          }`}
        />
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/10 to-secondary-500/10 opacity-0 transition-opacity duration-300 pointer-events-none ${
          isFocused ? 'opacity-100' : ''
        }`}></div>
      </div>
      {helperText && !error && (
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {helperText}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1 animate-slide-up">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
