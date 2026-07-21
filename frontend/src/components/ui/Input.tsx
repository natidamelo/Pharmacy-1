import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, helper, leftIcon, className = '', id, ...props }) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
          {props.required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle">{leftIcon}</span>
        )}
        <input
          id={inputId}
          {...props}
          className={`
            w-full rounded-lg border text-sm text-ink bg-white px-3 py-2.5 transition-all
            placeholder:text-ink-subtle
            border-border hover:border-primary/40
            focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
            disabled:bg-surface-hover disabled:text-ink-subtle disabled:cursor-not-allowed
            ${leftIcon ? 'pl-9' : ''}
            ${error ? 'border-danger focus:border-danger focus:ring-danger/20' : ''}
            ${className}
          `}
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      {helper && !error && <p className="text-xs text-ink-subtle">{helper}</p>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select: React.FC<SelectProps> = ({ label, error, options, className = '', id, ...props }) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-ink">
          {label}
          {props.required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        {...props}
        className={`
          w-full rounded-lg border text-sm text-ink bg-white px-3 py-2.5 transition-all
          border-border hover:border-primary/40
          focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
          ${error ? 'border-danger' : ''} ${className}
        `}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
};
