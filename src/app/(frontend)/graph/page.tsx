import type { Metadata } from 'next';

import { SiteHeader } from '@/components/discover/SiteHeader';
import { GraphWorkspace } from '@/components/graph/GraphWorkspace';
import type { GraphData } from '@/components/graph/types';

export const metadata: Metadata = { title: 'Relational Graph — Decentralizard' };

const data: GraphData = {
  coreId: 'core',
  nodes: [
    {
      id: 'core',
      address: '0xQ…A9B',
      label: 'Quantum State Coherence',
      cls: 'primary',
      influence: 94.2,
    },
    {
      id: 'n1',
      address: '0x7…E4D',
      label: 'Entanglement Theory',
      cls: 'synthesized',
      influence: 12.4,
    },
    {
      id: 'n2',
      address: '0x2…C08',
      label: 'Cryptography Impact',
      cls: 'commercial',
      influence: 8.9,
    },
    { id: 'n3', address: '0x9…F12', label: 'Decoherence Models', cls: 'primary', influence: 46 },
    { id: 'n4', address: '0x4…77A', label: 'Qubit Lattice', cls: 'synthesized', influence: 31 },
    { id: 'n5', address: '0xB…3C1', label: 'Error Correction', cls: 'primary', influence: 58 },
    { id: 'n6', address: '0xE…9D0', label: 'Market Adoption', cls: 'commercial', influence: 22 },
    { id: 'n7', address: '0x1…AA4', label: 'Photonic Bridge', cls: 'synthesized', influence: 18 },
  ],
  edges: [
    { source: 'core', target: 'n1', weight: 2 },
    { source: 'core', target: 'n3', weight: 1.5 },
    { source: 'core', target: 'n5', weight: 2 },
    { source: 'core', target: 'n4', weight: 1, dashed: true },
    { source: 'core', target: 'n2', weight: 1.5 },
    { source: 'n3', target: 'n5', weight: 1 },
    { source: 'n1', target: 'n7', weight: 1, dashed: true },
    { source: 'n5', target: 'n6', weight: 1 },
    { source: 'n2', target: 'n6', weight: 1 },
  ],
};

/** Preview route for the Nexus "Relational Graph" design (mock data, d3 force layout). */
export default function RelationalGraphPreview() {
  return (
    <div className="flex h-screen flex-col bg-background font-body text-foreground">
      <SiteHeader active="/graph" />
      <GraphWorkspace data={data} />
    </div>
  );
}
