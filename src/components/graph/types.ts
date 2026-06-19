export type NodeClass = 'primary' | 'synthesized' | 'commercial';

export interface GraphNode {
  id: string;
  address: string;
  label: string;
  cls: NodeClass;
  influence: number; // 0..100 → drives radius
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
  dashed?: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  coreId: string;
}
