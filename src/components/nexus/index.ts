/**
 * Nexus design-system shared atoms.
 * Reused across article-detail / deep-search / relational-graph / home-discover.
 */
export { StatusChip, type StatusChipProps } from './StatusChip';
export { Sparkline, type SparklineProps } from './Sparkline';
export { type Tone, toneVar, toneColor } from './tone';
export { TopNav, type NavLink, type TopNavProps } from './TopNav';
export { SiteFooter } from './SiteFooter';
export { NotificationsMenu, AppsMenu } from './HeaderMenus';

// Promote existing ArticleAnalyser atoms to a neutral import path (no file move = zero churn).
export { SearchInput } from '../ArticleAnalyser/SearchInput';
