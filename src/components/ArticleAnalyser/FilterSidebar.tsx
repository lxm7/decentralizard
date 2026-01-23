import React, { FC } from 'react';
import { cn } from '@/utilities/ui';
import { Post } from '@/payload-types';
import { ViewToggle } from './ViewToggle';
import { ViewType } from './types';
import { SliderFilter } from '@/components/SliderFilter';
import { SearchInput } from './SearchInput';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/base/accordion';
import { Checkbox } from '@/base/checkbox';
import { Label } from '@/base/label';
import { useFilterStore, TimeFilter } from '@/stores/useFilterStore';
import { useZoomStore } from '@/stores/useZoomStore';
import { useCategories } from './hooks';

interface FilterSidebarProps {
  posts: Post[];
  isOpen: boolean;
  onToggle: () => void;
  activeView?: ViewType;
  onViewChange?: (view: ViewType) => void;
}

export const FilterSidebar: FC<FilterSidebarProps> = ({
  posts,
  isOpen,
  onToggle,
  activeView,
  onViewChange,
}) => {
  const {
    selectedCategories,
    timeFilter,
    searchQuery,
    contentBalance,
    toggleCategory,
    setTimeFilter,
    setSearchQuery,
    setContentBalance,
  } = useFilterStore();
  const { zoomLevel, setZoomLevel } = useZoomStore();
  const categories = useCategories(posts);

  return (
    <>
      {/* Collapsible Sidebar - Fixed position */}
      <div
        className={cn(
          'fixed bottom-0 left-0 top-[57px] z-40 flex-shrink-0 border-r border-neutral-800 bg-[#0d1117] transition-all duration-300 ease-in-out',
          isOpen ? 'w-64' : 'w-0'
        )}
      >
        {isOpen && (
          <div className="flex h-full flex-col overflow-y-auto p-4">
            <div className="mb-8">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                variant="dark"
                placeholder="Search the Archives..."
              />
            </div>

            {/* View Toggle */}
            {activeView && onViewChange && (
              <div className="mb-8">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  View Mode
                </h3>
                <ViewToggle activeView={activeView} onViewChange={onViewChange} />
              </div>
            )}

            {/* Slider Filter */}
            <div className="mb-8">
              {activeView === 'wba' ? (
                <>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    Zoom Level
                  </h3>
                  <SliderFilter
                    leftLabel="100%"
                    rightLabel="800%"
                    value={[zoomLevel]}
                    min={1}
                    max={8}
                    step={1}
                    onValueChange={(value) => setZoomLevel(value[0])}
                  />
                </>
              ) : (
                <>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    Content Balance
                  </h3>
                  <SliderFilter
                    leftLabel="Analytical (Science)"
                    rightLabel="Expressive (Arts)"
                    value={[contentBalance]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => setContentBalance(value[0])}
                  />
                </>
              )}
            </div>

            {/* Time Filter */}
            <div className="mb-8">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Time Period
              </h3>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'today', label: 'Today' },
                  { value: 'week', label: 'This Week' },
                  { value: 'month', label: 'This Month' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center gap-2 text-sm text-neutral-300 hover:text-neutral-white"
                  >
                    <input
                      type="radio"
                      name="timeFilter"
                      value={option.value}
                      checked={timeFilter === option.value}
                      onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                      className="h-4 w-4 border-neutral-700 bg-neutral-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category Filter Accordion */}
            <div className="pb-4">
              <Accordion type="single" collapsible defaultValue="categories">
                <AccordionItem value="categories" className="border-neutral-800">
                  <AccordionTrigger className="text-xs font-semibold uppercase tracking-wide text-neutral-400 hover:text-neutral-300 hover:no-underline">
                    Categories ({selectedCategories.length} selected)
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-3">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center gap-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => toggleCategory(category)}
                            className="border-neutral-700 bg-neutral-900 data-[state=checked]:border-cyan-500 data-[state=checked]:bg-cyan-500"
                          />
                          <Label
                            htmlFor={`category-${category}`}
                            className="cursor-pointer text-left text-sm text-neutral-300 hover:text-neutral-white"
                          >
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        )}
      </div>

      {/* Toggle Sidebar Button */}
      <button
        onClick={onToggle}
        className="fixed top-1/2 z-50 -translate-y-1/2 rounded-r-lg border border-l-0 border-neutral-800 bg-neutral-900 p-2 transition-all hover:bg-neutral-800"
        style={{ left: isOpen ? '256px' : '0' }}
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        <svg
          className={cn('h-4 w-4 text-neutral-400 transition-transform', !isOpen && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </>
  );
};
