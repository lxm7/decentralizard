'use client'

import React, { useState, useEffect, useMemo, useRef, FC } from 'react'
import * as d3 from 'd3'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Post } from '@/payload-types'
import { PostWithMetrics, HierarchyNode, SizeMetric } from './types'
import { useCanvasStore } from '@/store/useCanvasStore'
import { cn } from '@/utilities/ui'

const headerHeight = 60
const TARGET_NODE_COUNT = 40 // Target number of articles to display at any zoom level

// Simple seeded random number generator for consistent SSR/client results
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

/**
 * A helper function that returns a shade of the base color.
 * The variation controls how much we brighten/darken.
 */
function getShade(baseColor: string, value: number, max: number, variation: number = 2): string {
  const t = max > 0 ? value / max : 0
  const brighter = d3.color(baseColor)?.brighter(variation).formatHex() || baseColor
  const darker = d3.color(baseColor)?.darker(variation).formatHex() || baseColor
  return d3.interpolateLab(brighter, darker)(t)
}

/*––––––––––––––––––––––––––––––––––––––
  ARTICLE ANALYZER – TREEMAP (Snippet 2)
–––––––––––––––––––––––––––––––––––––––––*/

export const ArticleTreeMap: FC<{ posts: Post[] }> = ({ posts }) => {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [sizeMetric] = useState<SizeMetric>('clicks')
  const [postsWithMetrics, setPostsWithMetrics] = useState<PostWithMetrics[]>([])

  // Store the current zoom state
  const [zoomState, setZoomState] = useState({
    scale: 1,
    centerX: 0,
    centerY: 0,
    visibleRegion: { x: 0, y: 0, width: 0, height: 0 },
  })

  // Cache the treemap nodes after layout computation
  const treemapNodesRef = useRef<d3.HierarchyRectangularNode<HierarchyNode>[]>([])
  const allNodesRef = useRef<d3.HierarchyRectangularNode<HierarchyNode>[]>([])

  // For hover interactions
  const [hoveredNode, setHoveredNode] = useState<d3.HierarchyRectangularNode<HierarchyNode> | null>(
    null,
  )
  const { dimensions, setDimensions } = useCanvasStore()
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Track the full hierarchy data
  const hierarchyRootRef = useRef<d3.HierarchyNode<HierarchyNode> | null>(null)

  // Set up canvas dimensions
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - headerHeight,
      })
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setDimensions])

  // Enrich posts with deterministic metrics (consistent across SSR and client)
  useEffect(() => {
    const enriched = posts.map((post) => {
      // Use post ID as seed for consistent random values
      const seed = typeof post.id === 'number' ? post.id : parseInt(String(post.id), 10) || 0
      const clicks = Math.floor(seededRandom(seed) * 2000) + 100
      const uniqueClicks = Math.floor(clicks * (0.7 + seededRandom(seed + 1) * 0.2))
      const clickRate = +((uniqueClicks / clicks) * 10 + seededRandom(seed + 2) * 2).toFixed(1)
      return { ...post, clicks, uniqueClicks, clickRate }
    })
    setPostsWithMetrics(enriched)
  }, [posts])

  // Build hierarchical data for the treemap
  const hierarchyData: HierarchyNode = useMemo(() => {
    const categorized: Record<string, PostWithMetrics[]> = {}
    postsWithMetrics.forEach((post) => {
      const category =
        post.category_titles && post.category_titles.length > 0
          ? post.category_titles[0]
          : 'Uncategorized'
      if (!categorized[category]) categorized[category] = []
      categorized[category].push(post)
    })
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
    }
  }, [postsWithMetrics])

  // Limit articles to target density
  const limitArticlesToTargetDensity = (
    nodes: d3.HierarchyRectangularNode<HierarchyNode>[],
    targetCount: number,
    zoomScale: number,
  ) => {
    // If we have fewer nodes than target, return all of them
    if (nodes.length <= targetCount) return nodes

    // Filter for leaf nodes (articles) and category nodes
    const categoryNodes = nodes.filter((n) => n.depth === 1)
    const leafNodes = nodes.filter((n) => !n.children && n.depth > 1)

    if (leafNodes.length <= targetCount) {
      // If we have fewer leaf nodes than target, return all categories and leaves
      return [...categoryNodes, ...leafNodes]
    }

    // When highly zoomed in, prioritize visible articles with higher values
    if (zoomScale > 2) {
      const sortedLeaves = [...leafNodes].sort((a, b) => (b.value || 0) - (a.value || 0))
      return [...categoryNodes, ...sortedLeaves.slice(0, targetCount - categoryNodes.length)]
    }

    // When moderately zoomed, group smaller articles by their parent category
    const topLeaves = leafNodes
      .sort((a, b) => (b.value || 0) - (a.value || 0))
      .slice(0, Math.floor(targetCount * 0.7))

    // The rest can be represented as aggregated nodes
    const remainingLeaves = leafNodes
      .sort((a, b) => (b.value || 0) - (a.value || 0))
      .slice(Math.floor(targetCount * 0.7))

    // Group by parent category
    const groupedByCat: Record<string, d3.HierarchyRectangularNode<HierarchyNode>[]> = {}
    remainingLeaves.forEach((node) => {
      const category = node.parent?.data.name || 'Uncategorized'
      if (!groupedByCat[category]) groupedByCat[category] = []
      groupedByCat[category].push(node)
    })

    // Return the categories, top leaves, and grouped nodes
    return [...categoryNodes, ...topLeaves]
  }

  // Calculate which nodes to display based on visible region
  const getNodesInVisibleRegion = (zoomState: {
    scale: number
    centerX: number
    centerY: number
    visibleRegion: { x: number; y: number; width: number; height: number }
  }) => {
    if (!allNodesRef.current.length) return []

    const { x, y, width, height } = zoomState.visibleRegion

    // Find nodes that intersect with the visible region
    const visibleNodes = allNodesRef.current.filter((node) => {
      return node.x0 < x + width && node.x1 > x && node.y0 < y + height && node.y1 > y
    })

    // Limit the number of nodes to a reasonable density
    return limitArticlesToTargetDensity(visibleNodes, TARGET_NODE_COUNT, zoomState.scale)
  }

  // Compute treemap layout for visible nodes
  const computeVisibleTreemap = (visibleNodes: d3.HierarchyRectangularNode<HierarchyNode>[]) => {
    if (!visibleNodes.length) return

    // Get category nodes and leaf nodes
    const categoryNodes = visibleNodes.filter((n) => n.depth === 1)
    const leafNodes = visibleNodes.filter((n) => !n.children && n.depth > 1)

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
    }

    // Create a new hierarchy and compute the treemap
    const root = d3
      .hierarchy<HierarchyNode>(tempHierarchy)
      .sum((d) => (!d.children ? d[sizeMetric] || 0 : 0))
      .sort((a, b) => (b.value || 0) - (a.value || 0))

    const treemapLayout = d3
      .treemap<HierarchyNode>()
      .size([dimensions.width, dimensions.height])
      .paddingOuter(3)
      .paddingTop(22)
      .paddingInner(1)
      .round(true)

    treemapLayout(root)

    // Store the new layout
    treemapNodesRef.current = root.descendants() as d3.HierarchyRectangularNode<HierarchyNode>[]
  }

  // Initial computation of the full treemap
  useEffect(() => {
    if (!hierarchyData.children || hierarchyData.children.length === 0) return

    // Create the full hierarchy
    const root = d3
      .hierarchy<HierarchyNode>(hierarchyData)
      .sum((d) => (!d.children ? d[sizeMetric] || 0 : 0))
      .sort((a, b) => (b.value || 0) - (a.value || 0))

    hierarchyRootRef.current = root

    // Compute the initial treemap for all nodes
    const treemapLayout = d3
      .treemap<HierarchyNode>()
      .size([dimensions.width, dimensions.height])
      .paddingOuter(3)
      .paddingTop(22)
      .paddingInner(1)
      .round(true)

    treemapLayout(root)

    // Store all nodes for reference
    allNodesRef.current = root.descendants() as d3.HierarchyRectangularNode<HierarchyNode>[]
    treemapNodesRef.current = allNodesRef.current

    // Update visible region based on dimensions
    setZoomState((prev) => ({
      ...prev,
      visibleRegion: {
        x: 0,
        y: 0,
        width: dimensions.width,
        height: dimensions.height,
      },
    }))

    // After computing the layout, draw the treemap
    draw()
  }, [hierarchyData, sizeMetric, dimensions])

  // When zoom state changes, recalculate visible nodes
  useEffect(() => {
    if (allNodesRef.current.length === 0) return

    const visibleNodes = getNodesInVisibleRegion(zoomState)

    if (zoomState.scale > 1.2) {
      // When zoomed in enough, compute a new treemap layout for just the visible nodes
      computeVisibleTreemap(visibleNodes)
    } else {
      // When at default zoom, use the full treemap
      treemapNodesRef.current = allNodesRef.current
    }

    draw()
  }, [zoomState])

  const renderConstants = useMemo(() => {
    if (!treemapNodesRef.current.length) {
      return null
    }
    const palette = ['#6A0DAD', '#228B22', '#FF5733', '#3498DB', '#F1C40F', '#9B59B6']
    const predefinedColors: Record<string, string> = {
      AI: palette[0],
      Earth: palette[1],
    }
    const categoryNodes = treemapNodesRef.current.filter((d) => d.depth === 1)
    const allCategories = categoryNodes.map((d) => d.data.name)
    const otherCategories = allCategories.filter((cat) => !(cat in predefinedColors))
    const ordinal = d3
      .scaleOrdinal<string, string>()
      .domain(otherCategories)
      .range(palette.slice(2))
    const categoryMax: Record<string, number> = {}
    categoryNodes.forEach((catNode) => {
      let maxVal = 0
      catNode.leaves().forEach((leaf) => {
        maxVal = Math.max(maxVal, leaf.data[sizeMetric] || 0)
      })
      categoryMax[catNode.data.name] = maxVal
    })
    return { palette, predefinedColors, categoryNodes, ordinal, categoryMax }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treemapNodesRef.current.length, sizeMetric])

  // Optimize the canvas setup
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = dimensions.width * dpr
    canvas.height = dimensions.height * dpr
    canvas.style.width = `${dimensions.width}px`
    canvas.style.height = `${dimensions.height}px`

    const context = canvas.getContext('2d')
    if (context) {
      context.scale(dpr, dpr)
    }
  }, [dimensions])

  // Draw the treemap
  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    context.save()
    context.clearRect(0, 0, canvas.width, canvas.height)

    const rc = renderConstants
    if (!rc) {
      context.restore()
      return
    }
    const { predefinedColors, ordinal, categoryMax } = rc

    treemapNodesRef.current.forEach((d) => {
      const x = d.x0,
        y = d.y0,
        w = d.x1 - d.x0,
        h = d.y1 - d.y0
      if (w <= 0 || h <= 0) return

      // Use different fills based on node type
      if (d.children) {
        // Category node with a colored background
        const categoryName = d.data.name
        const baseColor = predefinedColors[categoryName] || ordinal(categoryName) || '#333333'
        context.fillStyle = d3.color(baseColor)?.copy({ opacity: 0.7 })?.toString() || baseColor
      } else {
        // Article node
        const cat = d.parent?.data.name || 'Uncategorized'
        const baseColor = predefinedColors[cat] || ordinal(cat)
        const maxVal = categoryMax[cat] || 1
        context.fillStyle = getShade(baseColor, d.data[sizeMetric] || 0, maxVal)
      }

      context.strokeStyle = '#fff'
      context.lineWidth = 1
      context.beginPath()
      context.rect(x, y, w, h)
      context.fill()
      context.stroke()

      if (hoveredNode === d) {
        context.save()
        const lighterFill =
          d3.color(context.fillStyle)?.brighter(0.8).formatHex() || context.fillStyle
        context.fillStyle = lighterFill
        context.fillRect(x, y, w, h)
        context.restore()
      }

      // Draw text based on available space
      if (d.children) {
        // Category nodes
        if (w > 50 && h > 25) {
          context.font = 'bold 14px "Rubik"'
          context.textBaseline = 'top'
          context.fillStyle = '#fff'

          let catText = d.data.name || ''
          while (context.measureText(catText).width > w - 10 && catText.length > 1) {
            catText = catText.slice(0, -1)
          }
          if (catText !== d.data.name) catText += '...'
          context.fillText(catText, x + 5, y + 5)
        }
      } else {
        // Article nodes - size-based rendering
        if (w > 80 && h > 45) {
          // Large articles - show title and value
          context.font = '12px "Rubik"'
          context.textBaseline = 'top'
          context.fillStyle = '#fff'

          let text = d.data.name || ''
          while (context.measureText(text).width > w - 10 && text.length > 1) {
            text = text.slice(0, -1)
          }
          if (text !== d.data.name) text += '...'
          context.fillText(text, x + 5, y + 5)

          context.font = '10px "Rubik"'
          const value = d.data[sizeMetric]
          const valueText = sizeMetric === 'clickRate' ? `${value}%` : value?.toLocaleString() || ''
          context.fillText(valueText, x + 5, y + 20)
        } else if (w > 40 && h > 25) {
          // Medium articles - just show title
          context.font = '11px "Rubik"'
          context.textBaseline = 'top'
          context.fillStyle = '#fff'

          let text = d.data.name || ''
          while (context.measureText(text).width > w - 8 && text.length > 1) {
            text = text.slice(0, -1)
          }
          if (text !== d.data.name) text += '...'
          context.fillText(text, x + 4, y + 4)
        } else if (w > 20 && h > 15) {
          // Small articles - just show a truncated title
          context.font = '9px "Rubik"'
          context.textBaseline = 'top'
          context.fillStyle = '#fff'

          let text = d.data.name?.substring(0, 5) || ''
          if (text.length < d.data.name?.length) text += '...'
          context.fillText(text, x + 3, y + 3)
        } else if (w > 10 && h > 10) {
          // Tiny articles - just show a dot
          context.fillStyle = '#fff'
          context.beginPath()
          context.arc(x + w / 2, y + h / 2, 2, 0, 2 * Math.PI)
          context.fill()
        }
        // For very tiny articles, just the colored rectangle is visible
      }
    })

    context.restore()
  }

  // Handle semantic zooming
  const handleZoom = (event: d3.D3ZoomEvent<HTMLCanvasElement, unknown>) => {
    if (isTransitioning) return

    // Throttle zoom events to reduce frequency
    if (!throttleZoom()) return
    setIsTransitioning(true)

    const canvas = canvasRef.current
    if (!canvas) {
      setIsTransitioning(false)
      return
    }

    // Get mouse position in canvas coordinates
    const [pointerX, pointerY] = d3.pointer(event, canvas)

    // Calculate the new scale and transform
    const newScale = event.transform.k

    // Calculate visible region in the original treemap coordinates
    const visibleWidth = dimensions.width / newScale
    const visibleHeight = dimensions.height / newScale

    // Center on mouse position
    const visibleX = pointerX - visibleWidth / 2
    const visibleY = pointerY - visibleHeight / 2

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
    })

    setTimeout(() => setIsTransitioning(false), 300)
  }

  const throttleZoom = (() => {
    let lastCall = 0
    const threshold = 25 // ms between zoom updates
    return () => {
      const now = Date.now()
      if (now - lastCall < threshold) return false
      lastCall = now
      return true
    }
  })()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const zoom = d3
      .zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([1, 8])
      .wheelDelta((event) => {
        // Reduce scroll sensitivity
        return -event.deltaY * 0.004
      })
      .filter((event) => {
        // IMPORTANT: Allow pinch events by removing the filter on ctrlKey
        // This was blocking pinch gestures on touch devices
        return !(event.button && event.type === 'mousedown')
      })
      .interpolate(d3.interpolateZoom)
      .on('zoom', function (event) {
        // Round scale to nearest 0.25 increment
        const k = Math.round(event.transform.k * 4) / 4
        const transform = d3.zoomIdentity.scale(k)
        handleZoom({ ...event, transform })
      })

    d3.select(canvas)
      .call(zoom)
      .on('dblclick.zoom', null)
      // Use touchstart with { passive: false } to prevent scrolling
      // when performing touch gestures
      .on(
        'touchstart',
        function (event) {
          event.preventDefault()
        },
        { passive: false },
      )

    // Optional: Set initial zoom transform if needed
    // d3.select(canvas).call(zoom.transform, d3.zoomIdentity)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions, isTransitioning])

  // Find node at position
  const findNodeAtPosition = (x: number, y: number) => {
    for (const node of treemapNodesRef.current) {
      if (x >= node.x0 && x <= node.x1 && y >= node.y0 && y <= node.y1) {
        if (!node.children) {
          return node
        }
      }
    }
    return null
  }

  // Add mouse event listeners
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top

      const hit = findNodeAtPosition(mouseX, mouseY)
      setHoveredNode(hit)

      // Set cursor style
      canvas.style.cursor = hit ? 'pointer' : 'default'

      if (hit && tooltipRef.current) {
        tooltipRef.current.style.opacity = '1'
        tooltipRef.current.style.left = `${event.pageX + 10}px`
        tooltipRef.current.style.top = `${event.pageY + 10}px`
        tooltipRef.current.innerHTML = `
          <div class="font-bold text-sm mb-2">${hit.data.name}</div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-gray-600 mr-3">Total Clicks:</span>
            <span class="font-medium">${hit.data.clicks?.toLocaleString() || ''}</span>
          </div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-gray-600 mr-3">Unique Clicks:</span>
            <span class="font-medium">${hit.data.uniqueClicks?.toLocaleString() || ''}</span>
          </div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-gray-600 mr-3">Click Rate:</span>
            <span class="font-medium">${hit.data.clickRate ? hit.data.clickRate + '%' : ''}</span>
          </div>
        `
      } else if (tooltipRef.current) {
        tooltipRef.current.style.opacity = '0'
      }
    }

    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top

      const hit = findNodeAtPosition(mouseX, mouseY)
      if (hit && !hit.children && hit.data.slug) {
        window.gtag('event', 'article_click', {
          event_category: hit.parent?.data.name || 'Uncategorized',
          event_label: hit.data.name,
          event_link: `/posts/${hit.data.slug}`,
          transport_type: 'beacon',
        })
        router.push(`/posts/${hit.data.slug}`)
      }
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('click', handleClick)
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('click', handleClick)
    }
  }, [])

  // Reset zoom
  const handleResetZoom = () => {
    if (isTransitioning) return

    setIsTransitioning(true)
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
    })

    // Reset to the full treemap
    treemapNodesRef.current = allNodesRef.current
    draw()

    setTimeout(() => setIsTransitioning(false), 300)
  }

  // Re-draw when hovered node changes
  useEffect(() => {
    draw()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredNode])

  return (
    <main className="relative flex h-full w-full flex-col" role="main">
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
                  text: string
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
          className="pointer-events-none absolute z-10 max-w-xs rounded border border-gray-300 bg-white bg-opacity-95 p-3 opacity-0 shadow-lg transition-opacity duration-200"
        />

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex space-x-2 rounded-lg bg-white p-2 shadow">
          <button
            className="flex h-8 w-8 items-center justify-center rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
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
        <div className="absolute bottom-4 left-4 rounded-lg bg-white px-3 py-2 text-xs text-gray-600 shadow">
          <div className="flex items-center">
            <span>Zoom: {Math.round(zoomState.scale * 100)}%</span>
          </div>
        </div>
      </section>
    </main>
  )
}

/*––––––––––––––––––––––––––––––––––––––
  SEARCH INPUT & PARENT INTEGRATION (Snippet 1)
–––––––––––––––––––––––––––––––––––––––––*/

/**
 * A simple search input that accepts text and calls onChange.
 */
const SearchInput: FC<{
  value: string
  onChange: (value: string) => void
}> = ({ value, onChange }) => {
  return (
    <div className="relative">
      <label htmlFor="article-search" className="sr-only">
        Search articles
      </label>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        id="article-search"
        type="search"
        placeholder="Search articles by title..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        aria-label="Search articles by title"
      />
    </div>
  )
}

/**
 * Mobile-friendly list view for articles
 */
const ArticleMobileList: FC<{ posts: Post[] }> = ({ posts }) => {
  const postsWithMetrics = useMemo(() => {
    return posts.map((post) => {
      // Use post ID as seed for consistent random values across SSR and client
      const seed = typeof post.id === 'number' ? post.id : parseInt(String(post.id), 10) || 0
      const clicks = Math.floor(seededRandom(seed) * 2000) + 100
      const uniqueClicks = Math.floor(clicks * (0.7 + seededRandom(seed + 1) * 0.2))
      const clickRate = +((uniqueClicks / clicks) * 10 + seededRandom(seed + 2) * 2).toFixed(1)
      return { ...post, clicks, uniqueClicks, clickRate }
    })
  }, [posts])

  // Group posts by category and sort by clicks
  const categorizedPosts = useMemo(() => {
    const categorized: Record<string, PostWithMetrics[]> = {}
    postsWithMetrics.forEach((post) => {
      const category =
        post.category_titles && post.category_titles.length > 0
          ? post.category_titles[0]
          : 'Uncategorized'
      if (!categorized[category]) categorized[category] = []
      categorized[category].push(post)
    })
    // Sort articles within each category by clicks (descending)
    Object.keys(categorized).forEach((category) => {
      categorized[category].sort((a, b) => b.clicks - a.clicks)
    })
    return categorized
  }, [postsWithMetrics])

  const palette = ['#6A0DAD', '#228B22', '#FF5733', '#3498DB', '#F1C40F', '#9B59B6']
  const predefinedColors: Record<string, string> = {
    AI: palette[0],
    Earth: palette[1],
  }

  const getCategoryColor = (category: string) => {
    if (predefinedColors[category]) return predefinedColors[category]
    const index = Object.keys(categorizedPosts).indexOf(category) % palette.length
    return palette[index]
  }

  // Calculate max clicks per category for color gradient
  const categoryMaxClicks = useMemo(() => {
    const maxClicks: Record<string, number> = {}
    Object.entries(categorizedPosts).forEach(([category, posts]) => {
      maxClicks[category] = Math.max(...posts.map((p) => p.clicks))
    })
    return maxClicks
  }, [categorizedPosts])

  // Get shade color for article based on clicks
  const getArticleColor = (category: string, clicks: number) => {
    const baseColor = getCategoryColor(category)
    const maxClicks = categoryMaxClicks[category] || 1
    return getShade(baseColor, clicks, maxClicks)
  }

  return (
    <div className="w-full overflow-y-auto" style={{ height: `calc(100vh - ${headerHeight}px)` }}>
      {Object.entries(categorizedPosts).map(([category, categoryPosts]) => (
        <div key={category}>
          {/* Category Header */}
          <div
            className="sticky top-0 z-10 px-4 py-2 text-sm font-bold text-white"
            style={{ backgroundColor: getCategoryColor(category) }}
          >
            {category} ({categoryPosts.length})
          </div>

          {/* Articles in this category */}
          <div className="flex flex-col">
            {categoryPosts.map((post) => (
              <Link
                key={post.id}
                href={post.slug ? `/posts/${post.slug}` : '#'}
                className="flex h-[70px] items-center justify-between border-b border-white px-4 no-underline transition-all hover:brightness-110"
                style={{ backgroundColor: getArticleColor(category, post.clicks) }}
                onClick={() => {
                  if (post.slug) {
                    window.gtag('event', 'article_click', {
                      event_category: category,
                      event_label: post.title,
                      event_link: `/posts/${post.slug}`,
                      transport_type: 'beacon',
                    })
                  }
                }}
              >
                <span className="mr-3 flex-1 truncate text-sm font-medium text-white">
                  {post.title.replace(/\n\s*/g, ' ')}
                </span>
                <span className="whitespace-nowrap text-xs text-white/80">
                  {post.clicks?.toLocaleString()} clicks
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

type TimeFilter = 'all' | 'today' | 'week' | 'month' | 'year'

/**
 * This parent component integrates the search input with the treemap.
 * It filters the posts (by title in this example) and passes the filtered
 * posts to the ArticleAnalyzer.
 */
export const ArticleAnalyzer: FC<{
  posts: Post[]
}> = ({ posts }) => {
  const [searchString, setSearchString] = useState<string>('')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(posts)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [noResults, setNoResults] = useState<boolean>(false)

  // Apply time filtering
  const timeFilteredPosts = useMemo(() => {
    if (timeFilter === 'all') return posts

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    return posts.filter((post) => {
      if (!post.publishedAt) return false
      const publishedDate = new Date(post.publishedAt)

      switch (timeFilter) {
        case 'today':
          return publishedDate >= today
        case 'week': {
          const weekAgo = new Date(today)
          weekAgo.setDate(weekAgo.getDate() - 7)
          return publishedDate >= weekAgo
        }
        case 'month': {
          const monthAgo = new Date(today)
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          return publishedDate >= monthAgo
        }
        case 'year': {
          const yearAgo = new Date(today)
          yearAgo.setFullYear(yearAgo.getFullYear() - 1)
          return publishedDate >= yearAgo
        }
        default:
          return true
      }
    })
  }, [posts, timeFilter])

  useEffect(() => {
    if (!searchString) {
      setFilteredPosts(timeFilteredPosts)
      setNoResults(false)
      return
    }
    const lowerQuery = searchString.toLowerCase()
    const filtered = timeFilteredPosts.filter((post) => post.title.toLowerCase().includes(lowerQuery))
    // If the search term is a complete word and there are no matches
    if (filtered.length === 0 && searchString.trim().includes(' ') === false) {
      setNoResults(true)
      setIsLoading(true)

      // Mock API call delay
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 3000) // 3 seconds loading time

      return () => clearTimeout(timer)
    } else {
      setNoResults(false)
      setIsLoading(false)
      setFilteredPosts(filtered)
    }
  }, [searchString, timeFilteredPosts])

  return (
    <div>
      {/* Search and filter container - row on desktop, stack on mobile */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 md:max-w-md">
              <SearchInput value={searchString} onChange={setSearchString} />
            </div>

            {/* Time filter radio buttons */}
            <div className="flex flex-col gap-2" role="radiogroup" aria-label="Filter articles by time period">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Time Period
              </span>
              <div className="flex flex-wrap gap-2">
                {(['all', 'today', 'week', 'month', 'year'] as const).map((filter) => (
                  <label
                    key={filter}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all',
                      'border-2 hover:shadow-sm',
                      timeFilter === filter
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                    )}
                  >
                    <input
                      type="radio"
                      name="timeFilter"
                      value={filter}
                      checked={timeFilter === filter}
                      onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                      className="sr-only"
                      aria-label={filter === 'all' ? 'All articles' : filter === 'today' ? 'Articles from today' : filter === 'week' ? 'Articles from this week' : filter === 'month' ? 'Articles from this month' : 'Articles from this year'}
                    />
                    <span>
                      {filter === 'all' ? 'All' : filter === 'today' ? 'Today' : filter === 'week' ? 'This Week' : filter === 'month' ? 'This Month' : 'This Year'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-3 text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredPosts.length}</span> {filteredPosts.length === 1 ? 'article' : 'articles'}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="text-base text-gray-500">Searching with AI...</div>
            <div className="relative h-8 w-32">
              <Image
                src="/images/logo2-white-loader-colour.svg"
                alt="Loading"
                fill
                className="ml-[-10px]"
              />
            </div>
          </div>
        </div>
      ) : noResults ? (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex w-full items-center justify-center text-base text-gray-500">
              No articles found for &quot;{searchString}&quot;
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile list view - shown on screens < 768px */}
          <div className="block md:hidden">
            <ArticleMobileList posts={filteredPosts} />
          </div>

          {/* Desktop treemap view - shown on screens >= 768px */}
          <div className="hidden md:block">
            <ArticleTreeMap posts={filteredPosts} />
          </div>
        </>
      )}
    </div>
  )
}
