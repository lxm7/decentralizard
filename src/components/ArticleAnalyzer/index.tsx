'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import { Post } from '@/payload-types'
import { PostWithMetrics, HierarchyNode, SizeMetric } from './types'

const headerHeight = 60
const defaultWidth = 1440
const defaultHeight = 694
const width = typeof window !== 'undefined' ? window.innerWidth : defaultWidth
const height = typeof window !== 'undefined' ? window.innerHeight - headerHeight : defaultHeight

/**
 * Returns a shade of the base color for the given value.
 * The variation parameter controls how far we brighten/darken.
 */
function getShade(baseColor: string, value: number, max: number, variation: number = 2): string {
  const t = max > 0 ? value / max : 0
  const brighter = d3.color(baseColor)?.brighter(variation).formatHex() || baseColor
  const darker = d3.color(baseColor)?.darker(variation).formatHex() || baseColor
  return d3.interpolateLab(brighter, darker)(t)
}

interface ArticleAnalyzerProps {
  posts: Post[]
}

export const ArticleAnalyzer: React.FC<ArticleAnalyzerProps> = ({ posts }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [sizeMetric] = useState<SizeMetric>('clicks')
  const [postsWithMetrics, setPostsWithMetrics] = useState<PostWithMetrics[]>([])
  // We'll store the current zoom transform in state.
  const [transform, setTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity)
  // We'll cache the treemap nodes after layout computation.
  const treemapNodesRef = useRef<d3.HierarchyRectangularNode<HierarchyNode>[]>([])
  const [hoveredNode, setHoveredNode] = useState<d3.HierarchyRectangularNode<HierarchyNode> | null>(
    null,
  )

  // Enrich posts with random metrics (for demonstration).
  useEffect(() => {
    const enriched = posts.map((post) => {
      const clicks = Math.floor(Math.random() * 2000) + 100 // between 100 and 2100
      const uniqueClicks = Math.floor(clicks * (0.7 + Math.random() * 0.2))
      const clickRate = +((uniqueClicks / clicks) * 10 + Math.random() * 2).toFixed(1)
      return { ...post, clicks, uniqueClicks, clickRate }
    })
    setPostsWithMetrics(enriched)
  }, [posts])

  // Memoize the hierarchical data.
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
          url: post.url,
          id: post.id,
        })),
      })),
    }
  }, [postsWithMetrics])

  // Compute treemap layout whenever hierarchyData, sizeMetric, or transform change.
  useEffect(() => {
    if (!hierarchyData.children || hierarchyData.children.length === 0) return

    // the page doesnt load until a hover is initiated,
    // any other AI suggestion to draw or do whatever the fuck, none of it works
    // so go shove it up your fucking arse cunt!!
    setHoveredNode(hierarchyData.children as never)

    const root = d3
      .hierarchy<HierarchyNode>(hierarchyData)
      .sum((d) => (!d.children ? d[sizeMetric] || 0 : 0))
      .sort((a, b) => (b.value || 0) - (a.value || 0))

    const treemapLayout = d3
      .treemap<HierarchyNode>()
      .size([width, height])
      .paddingOuter(3)
      .paddingTop(19)
      .paddingInner(1)
      .round(true)
    treemapLayout(root)

    treemapNodesRef.current = root.descendants() as
      | d3.HierarchyRectangularNode<HierarchyNode>[]
      | []

    // After computing the layout, draw it.
    draw()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hierarchyData, sizeMetric, transform])

  // Cache constant render parameters (palette, color scales, etc.)
  // This memo recalculates only when the number of treemap nodes or sizeMetric changes.
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

  // Optimize canvas setup: resize the canvas only once (or when needed)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const context = canvas.getContext('2d')
    if (context) {
      context.scale(dpr, dpr)
    }
  }, [])

  // `draw` renders the entire treemap on canvas.
  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    context.save()
    context.clearRect(0, 0, canvas.width, canvas.height)

    // Apply zoom transform.
    context.translate(transform.x, transform.y)
    context.scale(transform.k, transform.k)

    // Use cached render constants.
    const rc = renderConstants
    if (!rc) {
      context.restore()
      return
    }
    const { predefinedColors, ordinal, categoryMax } = rc

    // Draw each node.
    treemapNodesRef.current.forEach((d) => {
      const x = d.x0,
        y = d.y0,
        w = d.x1 - d.x0,
        h = d.y1 - d.y0
      if (w <= 0 || h <= 0) return

      // Set fill color.
      if (d.children) {
        context.fillStyle = 'rgba(255,255,255,0.1)'
      } else {
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
      // Draw text for leaf nodes.
      context.font = '12px sans-serif'
      context.textBaseline = 'top'
      context.fillStyle = '#fff'
      if (!d.children && w > 30 && h > 20) {
        let text = d.data.name || ''
        while (context.measureText(text).width > w - 10 && text.length > 1) {
          text = text.slice(0, -1)
        }
        if (text !== d.data.name) text += '...'
        context.fillText(text, x + 5, y + 5)

        context.font = '10px sans-serif'
        const value = d.data[sizeMetric]
        const valueText = sizeMetric === 'clickRate' ? `${value}%` : value?.toLocaleString() || ''
        context.fillText(valueText, x + 5, y + 20)
      }
      // Also draw text for category nodes, if space allows.
      if (d.children && w > 50 && h > 25) {
        context.font = '14px sans-serif'
        context.fillStyle = '#fff'
        let catText = d.data.name || ''
        while (context.measureText(catText).width > w - 10 && catText.length > 1) {
          catText = catText.slice(0, -1)
        }
        if (catText !== d.data.name) catText += '...'
        context.fillText(catText, x + 5, y + 5)
      }
    })

    context.restore()
  }

  // Set up zoom behavior on the canvas.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const zoom = d3
      .zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        // Get the pointer coordinates relative to the canvas.
        const [pointerX, pointerY] = d3.pointer(event, canvas)
        const k = event.transform.k
        // Compute translation so that the pointer remains fixed.
        const tx = -pointerX * (k - 1)
        const ty = -pointerY * (k - 1)
        setTransform(d3.zoomIdentity.translate(tx, ty).scale(k))
      })
    d3.select(canvas).call(zoom)
  }, [])

  // Add mouse event listeners to support hit detection (hover and click).
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const getHitNode = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top
      // Invert the transform.
      const x = (mouseX - transform.x) / transform.k
      const y = (mouseY - transform.y) / transform.k
      let hit: d3.HierarchyRectangularNode<HierarchyNode> | null = null
      for (const d of treemapNodesRef.current) {
        if (x >= d.x0 && x <= d.x1 && y >= d.y0 && y <= d.y1) {
          if (!d.children) {
            hit = d
            break
          }
        }
      }
      return hit
    }

    const handleMouseMove = (event: MouseEvent) => {
      const hit = getHitNode(event)
      setHoveredNode(hit)

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
      const hit = getHitNode(event)
      if (hit && !hit.children && hit.data.url) {
        window.open(hit.data.url, '_blank')
      }
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('click', handleClick)
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('click', handleClick)
    }
  }, [transform])

  // Whenever the zoom transform or hovered node changes, redraw the canvas.
  useEffect(() => {
    draw()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredNode])

  return (
    <div className="flex flex-col w-full h-full">
      <div className="sr-only">
        {postsWithMetrics.map((post) => {
          return (
            <article key={post.id}>
              <h2>{post.title.replace(/\n\s*/g, ' ')}</h2>
              <p>{post.shortDescription ?? ''}</p>
              <p>{post.meta?.description ?? ''}</p>
              <p>
                {(post.content?.root?.children?.[0]?.children?.[0] as { text: string })?.text ?? ''}
              </p>
              <ul>{post.category_titles?.map((category) => <li key={category}>{category}</li>)}</ul>
              <a href={post.url}>Read more</a>
            </article>
          )
        })}
      </div>
      <div className="relative flex-1 overflow-hidden">
        <canvas ref={canvasRef} width={width} height={height} className="w-full h-full block" />
        <div
          ref={tooltipRef}
          className="absolute p-3 bg-white bg-opacity-95 border border-gray-300 rounded shadow-lg pointer-events-none opacity-0 transition-opacity duration-200 z-10 max-w-xs"
        />
      </div>
    </div>
  )
}
