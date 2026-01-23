'use client';

import React from 'react';
import { cn } from '@/utilities/ui';
import { Slider } from '@/base/slider';

interface SliderFilterProps {
  className?: string;
  leftLabel: string;
  rightLabel: string;
  leftColor?: string;
  rightColor?: string;
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
}

export const SliderFilter = ({
  className,
  leftLabel,
  rightLabel,
  leftColor = 'text-cyan-400',
  rightColor = 'text-purple-400',
  value,
  defaultValue = [50],
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
}: SliderFilterProps) => {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Slider
        value={value}
        defaultValue={defaultValue}
        min={min}
        max={max}
        step={step}
        onValueChange={onValueChange}
        className="w-full"
      />
      <div className="flex items-center justify-between">
        <span className={cn('text-xs font-medium uppercase tracking-wider', leftColor)}>
          {leftLabel}
        </span>
        <span className={cn('text-right text-xs font-medium uppercase tracking-wider', rightColor)}>
          {rightLabel}
        </span>
      </div>
    </div>
  );
};
