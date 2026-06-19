import type { Metadata } from 'next';
import { ArrowUpRight, Network, Quote, Wallet } from 'lucide-react';

import { Button } from '@/base/button';
import { TopNav } from '@/components/nexus';
import { ArticleHero } from '@/components/article/ArticleHero';
import { CorrelatedGrid } from '@/components/article/CorrelatedGrid';
import { DataSnapshotPanel } from '@/components/article/DataSnapshotPanel';

export const metadata: Metadata = { title: 'Article Detail — Nexus preview' };

/**
 * Preview route for the Nexus "Article Detail" design (mock data).
 * Components are prop-driven; wire to `posts/[slug]` + Payload metric fields later.
 */
export default function ArticleDetailPreview() {
  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <TopNav
        brand="NexusGraph"
        links={[
          { label: 'Market Analysis', href: '#' },
          { label: 'Tech Deep-dives', href: '#', active: true },
          { label: 'Validity Reports', href: '#' },
        ]}
        actions={
          <>
            <Button variant="ghost" size="icon" aria-label="Graph">
              <Network className="h-5 w-5" aria-hidden />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Wallet">
              <Wallet className="h-5 w-5" aria-hidden />
            </Button>
            <Button size="sm" className="rounded-full">
              Connect Wallet
            </Button>
          </>
        }
      />

      <main className="mx-auto grid max-w-max-width grid-cols-1 gap-xl px-margin-mobile py-xl md:px-margin-desktop lg:grid-cols-12">
        <article className="space-y-xl lg:col-span-8">
          <ArticleHero
            verified
            publishedLabel="Published 2h ago"
            title="The Decentralization Illusion: Analyzing Validator Distribution in Layer 2 Scaling Solutions"
            dek="A comprehensive technical deep-dive into the actual distribution of validator nodes across major L2 networks, revealing centralized failure points hidden behind decentralized marketing."
            author={{ name: 'Dr. Elias Vance', role: 'Lead Protocol Researcher', initials: 'EV' }}
          />

          <figure className="relative h-[360px] overflow-hidden rounded-2xl border border-border">
            <div className="from-accent-indigo/20 to-brand-teal/15 h-full w-full bg-gradient-to-br via-background" />
            <figcaption className="glass absolute bottom-sm right-sm px-sm py-1 font-mono text-[11px] text-muted-foreground">
              Fig 1. Node Topology Heatmap
            </figcaption>
          </figure>

          <div className="space-y-md font-body text-base leading-relaxed text-foreground">
            <p>
              The promise of Layer 2 (L2) solutions has always been increased throughput without
              sacrificing the core ethos of decentralization. Our latest algorithmic sweep of major
              rollup contracts reveals a starkly different reality.
            </p>
            <h2 className="pb-sm pt-lg font-display text-2xl font-semibold text-foreground">
              Validator Concentration Metrics
            </h2>
            <p>
              When observing the Sequencer node distribution, the data becomes alarming. In Network
              Alpha, 84% of all transactions processed in Q3 were routed through just three distinct
              IP clusters — a coordinated operational bottleneck.
            </p>

            <blockquote className="relative overflow-hidden rounded-xl border border-border bg-muted p-lg">
              <span className="absolute left-0 top-0 h-full w-1 bg-accent-indigo" />
              <Quote className="absolute right-md top-md h-12 w-12 text-border" aria-hidden />
              <p className="relative font-body text-lg italic text-muted-foreground">
                “Decentralization is not a binary state, but a spectrum. Currently, major L2s
                operate closer to permissioned databases than sovereign networks.”
              </p>
            </blockquote>

            <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-md font-mono text-[13px] leading-relaxed text-neutral-100">
              <code>{`function verifySequencerCommitment(bytes32 _stateRoot, address _validator)
  external view returns (bool)
{
  require(validatorSet[_validator], "Unauthorized");
  return oracle.verify(_stateRoot); // centralized oracle reliance
}`}</code>
            </pre>
          </div>
        </article>

        <aside className="lg:col-span-4">
          <DataSnapshotPanel
            sentiment={{
              label: 'Bearish',
              deltaPct: -12,
              tone: 'bear',
              series: [10, 14, 9, 16, 13, 18, 15, 20],
            }}
            sources={[
              { label: 'On-Chain Analytics', confidence: 99.2, icon: 'analytics' },
              { label: 'Smart Contract Audit', confidence: 96.5, icon: 'audit' },
            ]}
            resonance={{ views: '42.8k', shares: '1,204' }}
          />
        </aside>
      </main>

      <CorrelatedGrid
        items={[
          {
            featured: true,
            category: 'Tech Deep-dives',
            title: 'The MEV Supply Chain: Identifying Extraction Nodes',
            dek: 'How value is extracted from decentralized exchanges before transactions even hit the mempool, mapping the hidden actors in the ecosystem.',
            views: '120k',
          },
          { category: 'Validity Reports', title: 'Oracle Latency Arbitrage', views: '45k' },
        ]}
      />

      <footer className="border-border/60 bg-muted/40 border-t">
        <div className="mx-auto flex max-w-max-width flex-col items-center justify-between gap-md px-margin-desktop py-lg md:flex-row">
          <span className="font-display text-xl font-bold text-foreground">NexusGraph</span>
          <span className="font-body text-sm text-muted-foreground">
            © 2026 NexusGraph Protocol. Data transparency via decentralized oracles.
          </span>
          <span className="flex items-center gap-1 font-body text-sm text-muted-foreground">
            Protocol Docs <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        </div>
      </footer>
    </div>
  );
}
