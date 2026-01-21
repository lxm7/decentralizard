'use client';

import React from 'react';
import { cn } from '@/utilities/ui';
import { Slider } from '@/base/slider';

type SliderProps = React.ComponentProps<typeof Slider>;

export const SliderFilter = ({ className, ...props }: SliderProps) => {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Slider defaultValue={[50]} max={100} step={1} className="w-full" {...props} />
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-cyan-400">
          Analytical (Science)
        </span>
        <span className="text-xs font-medium uppercase tracking-wider text-purple-400">
          Expressive (Arts)
        </span>
      </div>
    </div>
  );
};
