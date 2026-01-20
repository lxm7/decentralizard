'use client';

import React from 'react';
import { cn } from '@/utilities/ui';
import { Slider } from '@/base/slider';

type SliderProps = React.ComponentProps<typeof Slider>;

export const SliderFilter = ({ className, ...props }: SliderProps) => {
  return (
    <div className={cn('hidden items-center gap-4 lg:flex', className)}>
      <span className="text-xs font-medium uppercase tracking-wider text-cyan-400">
        Analytical
        <br />
        (Science)
      </span>

      <div className="relative w-48">
        <Slider
          defaultValue={[50]}
          max={100}
          step={1}
          className={cn('w-[200px]', className)}
          {...props}
        />
      </div>

      <span className="text-xs font-medium uppercase tracking-wider text-purple-400">
        Expressive
        <br />
        (Arts)
      </span>
    </div>
  );
};
