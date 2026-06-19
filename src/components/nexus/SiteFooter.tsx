import Link from 'next/link';
import {
  Facebook,
  Github,
  Globe,
  Instagram,
  Linkedin,
  MessageCircle,
  Network,
  Rss,
  Send,
  Youtube,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/utilities/ui';

import { FooterSubscribe } from './FooterSubscribe';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

const COLUMNS: FooterColumn[] = [
  {
    heading: 'Explore',
    links: [
      { label: 'Home', href: '/' },
      { label: 'News', href: '/posts' },
      { label: 'Graph', href: '/graph' },
      { label: 'Search', href: '/search' },
    ],
  },
  {
    heading: 'Discover',
    links: [
      { label: 'Deep Dives', href: '#' },
      { label: 'Coins', href: '#' },
      { label: 'Videos', href: '#' },
      { label: 'News Explorer', href: '#' },
    ],
  },
  {
    heading: 'About',
    links: [
      { label: 'Team', href: '#' },
      { label: 'Disclosures', href: '#' },
      { label: 'Manifesto', href: '#' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Terms of Service', href: '#' },
      { label: 'Code of Conduct', href: '#' },
      { label: 'Privacy Policy', href: '#' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Contact', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Jobs', href: '#' },
    ],
  },
];

const SOCIALS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: 'X', href: '#', icon: MessageCircle },
  { label: 'Instagram', href: '#', icon: Instagram },
  { label: 'LinkedIn', href: '#', icon: Linkedin },
  { label: 'Facebook', href: '#', icon: Facebook },
  { label: 'YouTube', href: '#', icon: Youtube },
  { label: 'GitHub', href: '#', icon: Github },
  { label: 'Telegram', href: '#', icon: Send },
  { label: 'RSS', href: '#', icon: Rss },
  { label: 'Web', href: '#', icon: Globe },
];

/** Multi-column site footer (modeled on the reference design). Server component. */
export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn('bg-card/40 mt-xl border-t border-border backdrop-blur-sm', className)}>
      <div className="mx-auto max-w-max-width px-margin-mobile py-xl md:px-margin-desktop">
        <div className="grid gap-xl lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          {/* Brand + socials */}
          <div className="flex flex-col gap-md">
            <Link href="/" className="flex items-center gap-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-indigo text-white">
                <Network className="h-5 w-5" aria-hidden />
              </span>
              <span className="font-display text-xl font-bold tracking-tight text-foreground">
                Decentralizard
              </span>
            </Link>
            <p className="max-w-xs font-body text-sm text-muted-foreground">
              Your gateway into the decentralized world — news, culture, crypto and music.
            </p>
            <ul className="flex flex-wrap gap-sm">
              {SOCIALS.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <Link
                    href={href}
                    aria-label={label}
                    className="bg-background/70 flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent-indigo hover:text-accent-indigo"
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Link columns */}
          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-lg sm:grid-cols-3 lg:grid-cols-5"
          >
            {COLUMNS.map((col) => (
              <div key={col.heading} className="flex flex-col gap-sm">
                <h2 className="font-body text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {col.heading}
                </h2>
                <ul className="flex flex-col gap-xs">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="font-body text-sm text-foreground transition-colors hover:text-accent-indigo"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Newsletter */}
        <div className="border-border/60 mt-xl flex flex-col gap-sm border-t pt-xl">
          <h2 className="font-body text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Subscribe to our newsletter
          </h2>
          <p className="font-body text-sm text-muted-foreground">
            The latest news, articles, and resources, sent to your inbox weekly.
          </p>
          <FooterSubscribe />
        </div>

        {/* Bottom bar */}
        <p className="border-border/60 mt-xl border-t pt-xl font-body text-xs text-muted-foreground">
          © By PolyKinesis LTD - {new Date().getFullYear()} - Decentralizard Media, Inc.
        </p>
      </div>
    </footer>
  );
}
