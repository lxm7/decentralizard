import React, { FC } from 'react';
import { SearchVariant } from './types';

const searchVariantStyles: Record<
  SearchVariant,
  { container: string; icon: string; input: string; filterBtn: string }
> = {
  light: {
    container: 'relative',
    icon: 'h-5 w-5 text-neutral-400',
    input:
      'w-full rounded-lg border-2 border-neutral-300 bg-neutral-white py-2.5 pl-10 pr-4 text-base text-neutral-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 placeholder:text-neutral-400',
    filterBtn: 'hidden',
  },
  dark: {
    container: 'flex items-center gap-3 rounded-xl px-4 py-3 bg-border bg-input',
    icon: 'h-5 w-5 text-neutral-500',
    input:
      'flex-1 bg-transparent text-sm text-neutral-white placeholder:text-neutral-300 focus:outline-none',
    filterBtn: 'rounded-lg bg-[#2d333b] p-2 hover:bg-[#3d434b] transition-colors',
  },
};

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  variant?: SearchVariant;
  placeholder?: string;
}

export const SearchInput: FC<SearchInputProps> = ({
  value,
  onChange,
  variant = 'light',
  placeholder = 'Search articles by title...',
}) => {
  const styles = searchVariantStyles[variant];

  if (variant === 'dark') {
    return (
      <div className={styles.container}>
        <svg
          className={styles.icon}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.input}
          aria-label={placeholder}
        />
      </div>
    );
  }

  // Light variant (original style)
  return (
    <div className={styles.container}>
      <label htmlFor="article-search" className="sr-only">
        Search articles
      </label>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          className={styles.icon}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        id="article-search"
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.input}
        aria-label={placeholder}
      />
    </div>
  );
};
