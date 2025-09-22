
import React, { useState } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  icon?: React.ReactNode;
  helperText?: string;
  error?: string;
  showCharCount?: boolean;
}

const Textarea: React.FC<TextareaProps> = ({ 
  label, 
  id, 
  icon, 
  helperText, 
  error, 
  showCharCount = false,
  maxLength,
  value,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const charCount = typeof value === 'string' ? value.length : 0;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
        {icon && <span className="text-primary-400">{icon}</span>}
        {label}
        {showCharCount && maxLength && (
          <span className={`ml-auto text-xs ${charCount > maxLength * 0.9 ? 'text-yellow-400' : 'text-gray-400'}`}>
            {charCount}/{maxLength}
          </span>
        )}
      </label>
      <div className="relative group">
        <textarea
          id={id}
          value={value}
          maxLength={maxLength}
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={`w-full bg-gray-800/50 backdrop-blur-sm border-2 text-white rounded-xl p-4 transition-all duration-300 outline-none placeholder-gray-400 resize-none ${
            error 
              ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
              : isFocused
                ? 'border-primary-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 shadow-lg shadow-primary-500/10'
                : 'border-gray-600 hover:border-gray-500'
          }`}
          rows={6}
        />
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/10 to-secondary-500/10 opacity-0 transition-opacity duration-300 pointer-events-none ${
          isFocused ? 'opacity-100' : ''
        }`}></div>
        
        {/* Floating action button for AI suggestions */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button 
            type="button"
            className="p-2 bg-primary-500/20 hover:bg-primary-500/30 rounded-lg transition-colors duration-200"
            title="AI Writing Assistant"
          >
            <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </button>
        </div>
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

export default Textarea;
