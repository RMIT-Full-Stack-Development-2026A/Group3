import React from 'react';

const AuthInput = ({ label, icon, type = 'text', placeholder, value, onChange, required = false, disabled = false, error }) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-tertiary-dim ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
          </div>
        )}
        <input
          className={`w-full bg-surface-container-highest/60 border-0 border-b-2 py-4 ${icon ? 'pl-12' : 'pl-4'} pr-4 rounded-lg focus:ring-0 focus:border-primary focus:bg-surface-container-highest transition-all duration-300 text-on-surface placeholder:text-outline ${error ? 'border-error' : 'border-outline-variant/30'}`}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
        />
      </div>
      {error && <p className="text-xs text-error mt-1 ml-1">{error}</p>}
    </div>
  );
};

export default AuthInput;
