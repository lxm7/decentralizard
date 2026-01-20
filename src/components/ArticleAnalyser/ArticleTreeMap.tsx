import React, { FC, useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as d3 from 'd3';
import { Post } from '@/payload-types';
import { useCanvasStore } from '@/store/useCanvasStore';
import { SizeMetric, PostWithMetrics, HierarchyNode } from './types';
import {
  getShade,
  enrichPostsWithMetrics,
  CATEGORY_PALETTE,
  PREDEFINED_CATEGORY_COLORS,
} from './utils';

const TARGET_NODE_COUNT = 40; // Target number of articles to display at any zoom level

interface ArticleTreeMapProps {
  posts: Post[];
}

export const ArticleTreeMap: FC<ArticleTreeMapProps> = ({ posts }) => {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [sizeMetric] = useState<SizeMetric>('clicks');
  const [postsWithMetrics, setPostsWithMetrics] = useState<PostWithMetrics[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [clickedArticle, setClickedArticle] = useState<string | null>(null);

  // Store the current zoom state
  const [zoomState, setZoomState] = useState({
    scale: 1,
    centerX: 0,
    centerY: 0,
    visibleRegion: { x: 0, y: 0, width: 0, height: 0 },
  });

  // Cache the treemap nodes after layout computation
  const treemapNodesRef = useRef<d3.HierarchyRectangularNode<HierarchyNode>[]>([]);
  const allNodesRef = useRef<d3.HierarchyRectangularNode<HierarchyNode>[]>([]);

  // For hover interactions
  const [hoveredNode, setHoveredNode] = useState<d3.HierarchyRectangularNode<HierarchyNode> | null>(
    null
  );
  const { dimensions, setDimensions } = useCanvasStore();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Track the full hierarchy data
  const hierarchyRootRef = useRef<d3.HierarchyNode<HierarchyNode> | null>(null);

  // Set up canvas dimensions based on container
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height,
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setDimensions]);

  // Enrich posts with deterministic metrics (consistent across SSR and client)
  useEffect(() => {
    setPostsWithMetrics(enrichPostsWithMetrics(posts));
  }, [posts]);

  // Build hierarchical data for the treemap
  const hierarchyData: HierarchyNode = useMemo(() => {
    const categorized: Record<string, PostWithMetrics[]> = {};
    postsWithMetrics.forEach((post) => {
      const category =
        post.category_titles && post.category_titles.length > 0
          ? post.category_titles[0]
          : 'Uncategorized';
      if (!categorized[category]) categorized[category] = [];
      categorized[category].push(post);
    });
    return {
      name: 'Articles',
      children: Object.keys(categorized).map((category) => ({
        name: category,
        children: categorized[category].map((post) => ({
          name: post.title.replace(/\n\s*/g, ' '),
          clicks: post.clicks,
          uniqueClicks: post.uniqueClicks,
          clickRate: post.clickRate,
          slug: post.slug,
          id: post.id,
        })),
      })),
    };
  }, [postsWithMetrics]);

  // Limit articles to target density
  const limitArticlesToTargetDensity = (
    nodes: d3.HierarchyRectangularNode<HierarchyNode>[],
    targetCount: number,
    zoomScale: number
  ) => {
    // If we have fewer nodes than target, return all of them
    if (nodes.length <= targetCount) return nodes;

    // Filter for leaf nodes (articles) and category nodes
    const categoryNodes = nodes.filter((n) => n.depth === 1);
    const leafNodes = nodes.filter((n) => !n.children && n.depth > 1);

    if (leafNodes.length <= targetCount) {
      // If we have fewer leaf nodes than target, return all categories and leaves
      return [...categoryNodes, ...leafNodes];
    }

    // When highly zoomed in, prioritize visible articles with higher values
    if (zoomScale > 2) {
      const sortedLeaves = [...leafNodes].sort((a, b) => (b.value || 0) - (a.value || 0));
      return [...categoryNodes, ...sortedLeaves.slice(0, targetCount - categoryNodes.length)];
    }

    // When moderately zoomed, group smaller articles by their parent category
    const topLeaves = leafNodes
      .sort((a, b) => (b.value || 0) - (a.value || 0))
      .slice(0, Math.floor(targetCount * 0.7));

    // Return the categories, top leaves
    return [...categoryNodes, ...topLeaves];
  };

  // Calculate which nodes to display based on visible region
  const getNodesInVisibleRegion = (zoomState: {
    scale: number;
    centerX: number;
    centerY: number;
    visibleRegion: { x: number; y: number; width: number; height: number };
  }) => {
    if (!allNodesRef.current.length) return [];

    const { x, y, width, height } = zoomState.visibleRegion;

    // Find nodes that intersect with the visible region
    const visibleNodes = allNodesRef.current.filter((node) => {
      return node.x0 < x + width && node.x1 > x && node.y0 < y + height && node.y1 > y;
    });

    // Limit the number of nodes to a reasonable density
    return limitArticlesToTargetDensity(visibleNodes, TARGET_NODE_COUNT, zoomState.scale);
  };

  // Compute treemap layout for visible nodes
  const computeVisibleTreemap = (visibleNodes: d3.HierarchyRectangularNode<HierarchyNode>[]) => {
    if (!visibleNodes.length) return;

    // Get category nodes and leaf nodes
    const categoryNodes = visibleNodes.filter((n) => n.depth === 1);
    const leafNodes = visibleNodes.filter((n) => !n.children && n.depth > 1);

    // Create a new temporary hierarchy for layout
    const tempHierarchy: HierarchyNode = {
      name: 'Visible Articles',
      children: categoryNodes
        .map((catNode) => ({
          name: catNode.data.name,
          children: leafNodes
            .filter((leaf) => leaf.parent?.data.name === catNode.data.name)
            .map((leaf) => leaf.data),
        }))
        .filter((cat) => cat.children && cat.children.length > 0),
    };

    // Create a new hierarchy and compute the treemap
    const root = d3
      .hierarchy<HierarchyNode>(tempHierarchy)
      .sum((d) => (!d.children ? d[sizeMetric] || 0 : 0))
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treemapLayout = d3
      .treemap<HierarchyNode>()
      .size([dimensions.width, dimensions.height])
      .paddingOuter(3)
      .paddingTop(22)
      .paddingInner(1)
      .round(true);

    treemapLayout(root);

    // Store the new layout
    treemapNodesRef.current = root.descendants() as d3.HierarchyRectangularNode<HierarchyNode>[];
  };

  // Initial computation of the full treemap
  useEffect(() => {
    if (!hierarchyData.children || hierarchyData.children.length === 0) return;

    // Create the full hierarchy
    const root = d3
      .hierarchy<HierarchyNode>(hierarchyData)
      .sum((d) => (!d.children ? d[sizeMetric] || 0 : 0))
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    hierarchyRootRef.current = root;

    // Compute the initial treemap for all nodes
    const treemapLayout = d3
      .treemap<HierarchyNode>()
      .size([dimensions.width, dimensions.height])
      .paddingOuter(3)
      .paddingTop(22)
      .paddingInner(1)
      .round(true);

    treemapLayout(root);

    // Store all nodes for reference
    allNodesRef.current = root.descendants() as d3.HierarchyRectangularNode<HierarchyNode>[];
    treemapNodesRef.current = allNodesRef.current;

    // Update visible region based on dimensions
    setZoomState((prev) => ({
      ...prev,
      visibleRegion: {
        x: 0,
        y: 0,
        width: dimensions.width,
        height: dimensions.height,
      },
    }));

    // After computing the layout, draw the treemap
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hierarchyData, sizeMetric, dimensions]);

  // When zoom state changes, recalculate visible nodes
  useEffect(() => {
    if (allNodesRef.current.length === 0) return;

    const visibleNodes = getNodesInVisibleRegion(zoomState);

    if (zoomState.scale > 1.2) {
      // When zoomed in enough, compute a new treemap layout for just the visible nodes
      computeVisibleTreemap(visibleNodes);
    } else {
      // When at default zoom, use the full treemap
      treemapNodesRef.current = allNodesRef.current;
    }

    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomState]);

  const renderConstants = useMemo(() => {
    if (!treemapNodesRef.current.length) {
      return null;
    }
    const categoryNodes = treemapNodesRef.current.filter((d) => d.depth === 1);
    const allCategories = categoryNodes.map((d) => d.data.name);
    const otherCategories = allCategories.filter((cat) => !(cat in PREDEFINED_CATEGORY_COLORS));
    const ordinal = d3
      .scaleOrdinal<string, string>()
      .domain(otherCategories)
      .range(CATEGORY_PALETTE.slice(2));
    const categoryMax: Record<string, number> = {};
    categoryNodes.forEach((catNode) => {
      let maxVal = 0;
      catNode.leaves().forEach((leaf) => {
        maxVal = Math.max(maxVal, leaf.data[sizeMetric] || 0);
      });
      categoryMax[catNode.data.name] = maxVal;
    });
    return { categoryNodes, ordinal, categoryMax };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treemapNodesRef.current.length, sizeMetric]);

  // Optimize the canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;

    const context = canvas.getContext('2d');
    if (context) {
      context.scale(dpr, dpr);
    }
  }, [dimensions]);

  // Draw the treemap
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.save();
    context.clearRect(0, 0, canvas.width, canvas.height);

    const rc = renderConstants;
    if (!rc) {
      context.restore();
      return;
    }
    const { ordinal, categoryMax } = rc;

    treemapNodesRef.current.forEach((d) => {
      const x = d.x0,
        y = d.y0,
        w = d.x1 - d.x0,
        h = d.y1 - d.y0;
      if (w <= 0 || h <= 0) return;

      // Use different fills based on node type
      if (d.children) {
        // Category node with a colored background
        const categoryName = d.data.name;
        const baseColor =
          PREDEFINED_CATEGORY_COLORS[categoryName] || ordinal(categoryName) || '#333333';
        context.fillStyle = d3.color(baseColor)?.copy({ opacity: 0.7 })?.toString() || baseColor;
      } else {
        // Article node
        const cat = d.parent?.data.name || 'Uncategorized';
        const baseColor = PREDEFINED_CATEGORY_COLORS[cat] || ordinal(cat);
        const maxVal = categoryMax[cat] || 1;
        context.fillStyle = getShade(baseColor, d.data[sizeMetric] || 0, maxVal);
      }

      context.strokeStyle = '#fff';
      context.lineWidth = 1;
      context.beginPath();
      context.rect(x, y, w, h);
      context.fill();
      context.stroke();

      if (hoveredNode === d) {
        context.save();
        const lighterFill =
          d3.color(context.fillStyle)?.brighter(0.8).formatHex() || context.fillStyle;
        context.fillStyle = lighterFill;
        context.fillRect(x, y, w, h);
        context.restore();
      }

      // Draw text based on available space
      if (d.children) {
        // Category nodes
        if (w > 50 && h > 25) {
          context.font = 'bold 14px "Rubik"';
          context.textBaseline = 'top';
          context.fillStyle = '#fff';

          let catText = d.data.name || '';
          while (context.measureText(catText).width > w - 10 && catText.length > 1) {
            catText = catText.slice(0, -1);
          }
          if (catText !== d.data.name) catText += '...';
          context.fillText(catText, x + 5, y + 5);
        }
      } else {
        // Article nodes - size-based rendering
        if (w > 80 && h > 45) {
          // Large articles - show title and value
          context.font = '12px "Rubik"';
          context.textBaseline = 'top';
          context.fillStyle = '#fff';

          let text = d.data.name || '';
          while (context.measureText(text).width > w - 10 && text.length > 1) {
            text = text.slice(0, -1);
          }
          if (text !== d.data.name) text += '...';
          context.fillText(text, x + 5, y + 5);

          context.font = '10px "Rubik"';
          const value = d.data[sizeMetric];
          const valueText =
            sizeMetric === 'clickRate' ? `${value}%` : value?.toLocaleString() || '';
          context.fillText(valueText, x + 5, y + 20);
        } else if (w > 40 && h > 25) {
          // Medium articles - just show title
          context.font = '11px "Rubik"';
          context.textBaseline = 'top';
          context.fillStyle = '#fff';

          let text = d.data.name || '';
          while (context.measureText(text).width > w - 8 && text.length > 1) {
            text = text.slice(0, -1);
          }
          if (text !== d.data.name) text += '...';
          context.fillText(text, x + 4, y + 4);
        } else if (w > 20 && h > 15) {
          // Small articles - just show a truncated title
          context.font = '9px "Rubik"';
          context.textBaseline = 'top';
          context.fillStyle = '#fff';

          let text = d.data.name?.substring(0, 5) || '';
          if (text.length < d.data.name?.length) text += '...';
          context.fillText(text, x + 3, y + 3);
        } else if (w > 10 && h > 10) {
          // Tiny articles - just show a dot
          context.fillStyle = '#fff';
          context.beginPath();
          context.arc(x + w / 2, y + h / 2, 2, 0, 2 * Math.PI);
          context.fill();
        }
        // For very tiny articles, just the colored rectangle is visible
      }
    });

    context.restore();
  };

  // Handle semantic zooming
  const handleZoom = (event: d3.D3ZoomEvent<HTMLCanvasElement, unknown>) => {
    if (isTransitioning) return;

    // Throttle zoom events to reduce frequency
    if (!throttleZoom()) return;
    setIsTransitioning(true);

    const canvas = canvasRef.current;
    if (!canvas) {
      setIsTransitioning(false);
      return;
    }

    // Get mouse position in canvas coordinates
    const [pointerX, pointerY] = d3.pointer(event, canvas);

    // Calculate the new scale and transform
    const newScale = event.transform.k;

    // Calculate visible region in the original treemap coordinates
    const visibleWidth = dimensions.width / newScale;
    const visibleHeight = dimensions.height / newScale;

    // Center on mouse position
    const visibleX = pointerX - visibleWidth / 2;
    const visibleY = pointerY - visibleHeight / 2;

    // Update zoom state
    setZoomState({
      scale: newScale,
      centerX: pointerX,
      centerY: pointerY,
      visibleRegion: {
        x: visibleX,
        y: visibleY,
        width: visibleWidth,
        height: visibleHeight,
      },
    });

    setTimeout(() => setIsTransitioning(false), 300);
  };

  const throttleZoom = (() => {
    let lastCall = 0;
    const threshold = 25; // ms between zoom updates
    return () => {
      const now = Date.now();
      if (now - lastCall < threshold) return false;
      lastCall = now;
      return true;
    };
  })();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const zoom = d3
      .zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([1, 8])
      .wheelDelta((event) => {
        // Reduce scroll sensitivity
        return -event.deltaY * 0.004;
      })
      .filter((event) => {
        // IMPORTANT: Allow pinch events by removing the filter on ctrlKey
        // This was blocking pinch gestures on touch devices
        return !(event.button && event.type === 'mousedown');
      })
      .interpolate(d3.interpolateZoom)
      .on('zoom', function (event) {
        // Round scale to nearest 0.25 increment
        const k = Math.round(event.transform.k * 4) / 4;
        const transform = d3.zoomIdentity.scale(k);
        handleZoom({ ...event, transform });
      });

    d3.select(canvas)
      .call(zoom)
      .on('dblclick.zoom', null)
      // Use touchstart with { passive: false } to prevent scrolling
      // when performing touch gestures
      .on(
        'touchstart',
        function (event) {
          event.preventDefault();
        },
        { passive: false }
      );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions, isTransitioning]);

  // Find node at position
  const findNodeAtPosition = (x: number, y: number) => {
    for (const node of treemapNodesRef.current) {
      if (x >= node.x0 && x <= node.x1 && y >= node.y0 && y <= node.y1) {
        if (!node.children) {
          return node;
        }
      }
    }
    return null;
  };

  // Add mouse event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const hit = findNodeAtPosition(mouseX, mouseY);
      setHoveredNode(hit);

      // Set cursor style
      canvas.style.cursor = hit ? 'pointer' : 'default';

      if (hit && tooltipRef.current) {
        tooltipRef.current.style.opacity = '1';
        tooltipRef.current.style.left = `${event.pageX + 10}px`;
        tooltipRef.current.style.top = `${event.pageY + 10}px`;
        tooltipRef.current.innerHTML = `
          <div class="font-bold text-sm mb-2">${hit.data.name}</div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-neutral-600 mr-3">Total Clicks:</span>
            <span class="font-medium">${hit.data.clicks?.toLocaleString() || ''}</span>
          </div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-neutral-600 mr-3">Unique Clicks:</span>
            <span class="font-medium">${hit.data.uniqueClicks?.toLocaleString() || ''}</span>
          </div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-neutral-600 mr-3">Click Rate:</span>
            <span class="font-medium">${hit.data.clickRate ? hit.data.clickRate + '%' : ''}</span>
          </div>
        `;
      } else if (tooltipRef.current) {
        tooltipRef.current.style.opacity = '0';
      }
    };

    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const hit = findNodeAtPosition(mouseX, mouseY);
      if (hit && !hit.children && hit.data.slug) {
        setIsNavigating(true);
        setClickedArticle(hit.data.name);
        window.gtag('event', 'article_click', {
          event_category: hit.parent?.data.name || 'Uncategorized',
          event_label: hit.data.name,
          event_link: `/posts/${hit.data.slug}`,
          transport_type: 'beacon',
        });
        router.push(`/posts/${hit.data.slug}`);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset zoom
  const handleResetZoom = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setZoomState({
      scale: 1,
      centerX: dimensions.width / 2,
      centerY: dimensions.height / 2,
      visibleRegion: {
        x: 0,
        y: 0,
        width: dimensions.width,
        height: dimensions.height,
      },
    });

    // Reset to the full treemap
    treemapNodesRef.current = allNodesRef.current;
    draw();

    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Re-draw when hovered node changes
  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredNode]);

  return (
    <main ref={containerRef} className="relative flex h-full w-full flex-col" role="main">
      {/* Loading overlay */}
      {isNavigating && (
        <div className="bg-neutral-black/50 absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-lg bg-neutral-white p-8 shadow-2xl">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <div className="text-center">
              <p className="text-lg font-semibold text-neutral-900">Loading Article</p>
              {clickedArticle && (
                <p className="mt-1 max-w-sm truncate text-sm text-neutral-600">{clickedArticle}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SEO and accessibility block */}
      <section className="sr-only" aria-label="Detailed article information for SEO">
        {postsWithMetrics.map((post) => (
          <article key={post.id} role="article">
            <h2>{post.title.replace(/\n\s*/g, ' ')}</h2>
            <p>{post.shortDescription ?? ''}</p>
            <p>{post.meta?.description ?? ''}</p>
            <p>
              {(
                post.content?.root?.children?.[0]?.children?.[0] as {
                  text: string;
                }
              )?.text ?? ''}
            </p>
            <ul>
              {post.category_titles?.map((category) => (
                <li key={category}>{category}</li>
              ))}
            </ul>
            {post.slug && <a href={`/posts/${post.slug}`}>Read more</a>}
          </article>
        ))}
      </section>

      {/* The interactive treemap */}
      <section
        className="relative flex-1 overflow-hidden"
        aria-label="Interactive articles treemap"
        role="img"
      >
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="block h-full w-full"
          aria-label="Interactive treemap visualization of articles. Use scroll to zoom."
        />
        <div
          ref={tooltipRef}
          role="tooltip"
          aria-live="polite"
          className="pointer-events-none absolute z-10 max-w-xs rounded border border-neutral-300 bg-neutral-white bg-opacity-95 p-3 opacity-0 shadow-lg transition-opacity duration-200"
        />

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex space-x-2 rounded-lg bg-neutral-white p-2 shadow">
          <button
            className="flex h-8 w-8 items-center justify-center rounded bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50"
            onClick={handleResetZoom}
            disabled={isTransitioning || zoomState.scale === 1}
            aria-label="Reset zoom"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Zoom level indicator */}
        <div className="absolute bottom-4 left-4 rounded-lg bg-neutral-white px-3 py-2 text-xs text-neutral-600 shadow">
          <div className="flex items-center">
            <span>Zoom: {Math.round(zoomState.scale * 100)}%</span>
          </div>
        </div>
      </section>
    </main>
  );
};
