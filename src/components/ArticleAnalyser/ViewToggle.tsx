import React, { FC } from 'react';
import { cn } from '@/utilities/ui';
import { ViewType } from './types';

interface ViewToggleProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const ViewToggle: FC<ViewToggleProps> = ({ activeView, onViewChange }) => {
  return (
    <div className="flex h-10 items-center rounded-lg bg-neutral-800 p-1">
      <button
        onClick={() => onViewChange('default')}
        className={cn(
          'flex h-8 items-center justify-center gap-1 rounded-md px-3 transition-all',
          activeView === 'default' ? 'bg-neutral-700' : 'bg-transparent hover:bg-neutral-700'
        )}
        aria-label="Default view"
      >
        <div className="flex gap-[2px]">
          <div
            className={cn(
              'h-5 w-[4px] rounded-sm transition-colors',
              activeView === 'default' ? 'bg-brand-teal' : 'bg-neutral-500'
            )}
          />
          <div
            className={cn(
              'h-5 w-[4px] rounded-sm transition-colors',
              activeView === 'default' ? 'bg-brand-teal' : 'bg-neutral-500'
            )}
          />
          <div
            className={cn(
              'h-5 w-[4px] rounded-sm transition-colors',
              activeView === 'default' ? 'bg-brand-teal' : 'bg-neutral-500'
            )}
          />
        </div>
      </button>
      <button
        onClick={() => onViewChange('wba')}
        className={cn(
          'flex h-8 items-center justify-center gap-1 rounded-md px-3 transition-all',
          activeView === 'wba' ? 'bg-neutral-700' : 'bg-transparent hover:bg-neutral-700'
        )}
        aria-label="WBA view"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={cn(
            'transition-colors',
            activeView === 'wba' ? 'text-brand-teal' : 'text-neutral-500'
          )}
        >
          <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" />
          <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" />
          <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" />
          <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
};
