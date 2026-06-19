import type { Metadata } from 'next';
import { Bell, LayoutGrid } from 'lucide-react';

import { Button } from '@/base/button';
import { BottomNav, TopNav } from '@/components/nexus';
import { BentoMatrix, type BentoCell } from '@/components/discover/BentoMatrix';
import { DiscoverFilters } from '@/components/discover/DiscoverFilters';
import { HeroTopologyCard } from '@/components/discover/HeroTopologyCard';

export const metadata: Metadata = { title: 'Home / Discover — Nexus preview' };

const cells: BentoCell[] = [
  {
    kind: 'focus',
    tag: 'A.I. Sentience',
    index: '0.94 Alpha',
    title: 'The Sentience Threshold: AGI Models Show Unprompted Self-Correction',
    dek: 'Analysis of the latest neural mesh indicates spontaneous error-correction loops that bypass primary directive protocols. Analysts debate if this is primitive artificial intuition or complex algorithmic reflection.',
  },
  {
    kind: 'pulse',
    trends: [
      {
        label: 'Fusion Yields',
        delta: '+14.2% Net',
        tone: 'success',
        icon: 'fusion',
        series: [4, 6, 5, 9, 8, 12],
      },
      {
        label: 'Neural Mesh',
        delta: 'Stable Synapse',
        tone: 'indigo',
        icon: 'neural',
        series: [6, 7, 6, 8, 7, 9],
      },
      {
        label: 'Orbital Debris',
        delta: 'Critical Density',
        tone: 'error',
        icon: 'orbital',
        series: [3, 8, 4, 10, 6, 11],
      },
    ],
  },
  {
    kind: 'research',
    tag: 'Bio-Eng',
    title: 'CRISPR-Cas12f Miniaturization',
    dek: 'New delivery vectors allow precision editing in previously inaccessible cellular structures.',
    verified: true,
  },
  {
    kind: 'research',
    tag: 'Materials',
    title: 'Graphene Semiconductors',
    dek: 'Room-temperature operational stability achieved in 2nm graphene logic gates.',
    node: 'ZETA',
  },
];

/** Preview route for the Nexus "Home / Discover" design (mock data). */
export default function HomeDiscoverPreview() {
  return (
    <div className="kandinsky-bg min-h-screen font-body text-foreground">
      <TopNav
        brand="Nexus Matrix"
        leading={<DiscoverFilters />}
        links={[
          { label: 'Matrix', href: '#' },
          { label: 'Discover', href: '#', active: true },
          { label: 'Graph', href: '/nexus/relational-graph' },
          { label: 'Market', href: '#' },
          { label: 'Pulse', href: '#' },
        ]}
        actions={
          <>
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" aria-hidden />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Grid" className="hidden md:inline-flex">
              <LayoutGrid className="h-5 w-5" aria-hidden />
            </Button>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-indigo font-mono text-[12px] font-bold text-white">
              SA
            </span>
          </>
        }
      />

      <main className="mx-auto flex max-w-max-width flex-col gap-md px-margin-mobile py-md pb-[80px] md:px-margin-desktop lg:pb-md">
        <HeroTopologyCard
          node="KAPPA-9"
          synced
          title="Quantum Entanglement Achieved at Macroscopic Scale"
          dek="Researchers at the Horizon Institute have demonstrated quantum entanglement between two macroscopic objects, opening pathways for instantaneous macro-data transmission."
          nodes="42.8k"
        />
        <BentoMatrix cells={cells} />
      </main>

      <BottomNav active="grid" />
    </div>
  );
}
