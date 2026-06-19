import { AppsMenu, NotificationsMenu, TopNav } from '@/components/nexus';

import { SearchModal, SearchTrigger } from './SearchModal';
import { getFilterCategories } from './categories';

const NAV_LINKS = [
  { label: 'Archive', href: '/posts' },
  { label: 'Graph', href: '/graph' },
] as const;

/**
 * The single site header used on every page. Brand, nav links and action
 * buttons are identical everywhere — only the highlighted nav item varies via
 * `active` (the current route's href). Owns the SearchModal its button opens,
 * feeding it the live category list for the filter chips.
 */
export async function SiteHeader({ active }: { active?: string } = {}) {
  const categories = await getFilterCategories();
  return (
    <>
      <TopNav
        brand="Decentralizard"
        brandHref="/"
        links={NAV_LINKS.map((l) => ({ ...l, active: l.href === active }))}
        actions={
          <>
            <SearchTrigger />
            <NotificationsMenu />
            <AppsMenu className="hidden md:inline-flex" />
          </>
        }
      />
      <SearchModal categories={categories} />
    </>
  );
}
