import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean | string | { message?: string };
  label?: string;
  required?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, required, ...props }, ref) => {
    const errorMessage = React.useMemo(() => {
      if (!error) return null;
      if (typeof error === 'string') return error;
      if (typeof error === 'object' && error.message) return error.message;
      return null;
    }, [error]);

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-11 w-full rounded-lg border bg-white px-3 sm:px-4 py-2 text-base sm:text-sm shadow-sm transition-all duration-200',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            error 
              ? 'border-red-300 text-red-900 focus-visible:border-red-500 focus-visible:ring-red-500/20 dark:border-red-500 dark:text-red-400' 
              : 'border-gray-200 hover:border-gray-300 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 dark:border-gray-700 dark:hover:border-gray-600',
            className
          )}
          ref={ref}
          {...props}
        />
        {errorMessage && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean | string | { message?: string };
  label?: string;
  required?: boolean;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, required, placeholder, options, ...props }, ref) => {
    const errorMessage = React.useMemo(() => {
      if (!error) return null;
      if (typeof error === 'string') return error;
      if (typeof error === 'object' && error.message) return error.message;
      return null;
    }, [error]);

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <select
          className={cn(
            'flex h-11 w-full rounded-lg border bg-white px-3 sm:px-4 py-2 text-base sm:text-sm shadow-sm transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'appearance-none cursor-pointer',
            error 
              ? 'border-red-300 text-red-900 focus-visible:border-red-500 focus-visible:ring-red-500/20 dark:border-red-500 dark:text-red-400' 
              : 'border-gray-200 hover:border-gray-300 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 dark:border-gray-700 dark:hover:border-gray-600',
            className
          )}
          ref={ref}
          aria-placeholder={placeholder}
          {...props}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errorMessage && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean | string | { message?: string };
  label?: string;
  required?: boolean;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, error, label, required, ...props }, ref) => {
    const errorMessage = React.useMemo(() => {
      if (!error) return null;
      if (typeof error === 'string') return error;
      if (typeof error === 'object' && error.message) return error.message;
      return null;
    }, [error]);

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <textarea
          className={cn(
            'flex min-h-[100px] w-full rounded-lg border bg-white px-3 sm:px-4 py-3 text-base sm:text-sm shadow-sm transition-all duration-200',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50 resize-none',
            error 
              ? 'border-red-300 text-red-900 focus-visible:border-red-500 focus-visible:ring-red-500/20 dark:border-red-500 dark:text-red-400' 
              : 'border-gray-200 hover:border-gray-300 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 dark:border-gray-700 dark:hover:border-gray-600',
            className
          )}
          ref={ref}
          {...props}
        />
        {errorMessage && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);
TextArea.displayName = 'TextArea';

export { Input, Select, TextArea };