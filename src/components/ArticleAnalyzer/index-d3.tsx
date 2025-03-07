'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import { Post, PostWithMetrics, HierarchyNode, SizeMetric } from './types'

const headerHeight = 60
const width = window.innerWidth
const height = window.innerHeight - headerHeight

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
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [sizeMetric, setSizeMetric] = useState<SizeMetric>('clicks')
  const [postsWithMetrics, setPostsWithMetrics] = useState<PostWithMetrics[]>([])

  // Enrich posts with random metrics for demonstration.
  useEffect(() => {
    const enrichedPosts = posts.map((post) => {
      const clicks = Math.floor(Math.random() * 2000) + 100 // 100 – 2100
      const uniqueClicks = Math.floor(clicks * (0.7 + Math.random() * 0.2))
      const clickRate = +((uniqueClicks / clicks) * 10 + Math.random() * 2).toFixed(1)
      return { ...post, clicks, uniqueClicks, clickRate }
    })
    setPostsWithMetrics(enrichedPosts)
  }, [posts])

  // Memoize hierarchical data so we don't re-calc unnecessarily.
  const hierarchyData: HierarchyNode = useMemo(() => {
    // Group posts by category (using first category title or "Uncategorized").
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
          name: post.title,
          clicks: post.clicks,
          uniqueClicks: post.uniqueClicks,
          clickRate: post.clickRate,
          url: post.url,
          id: post.id,
        })),
      })),
    }
  }, [postsWithMetrics, sizeMetric])

  // D3 Rendering: isolated effect that runs only when hierarchyData changes.
  useEffect(() => {
    if (!hierarchyData.children || hierarchyData.children.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.attr('width', width).attr('height', height).style('display', 'block')

    // Instead of rebuilding entirely, try to update existing elements.
    // Use a persistent zoomable group. If not present, append it.
    let g = svg.select('.zoom-group')
    if (g.empty()) {
      g = svg.append('g').attr('class', 'zoom-group')
    }

    // Create D3 hierarchy and compute the treemap layout.
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

    // Define a fixed palette.
    const palette = ['#6A0DAD', '#228B22', '#FF5733', '#3498DB', '#F1C40F', '#9B59B6']
    // Predefine colours for key categories.
    const predefinedColors: Record<string, string> = {
      AI: palette[0], // Purple
      Earth: palette[1], // Green
    }
    const allCategories: string[] = (root.children || []).map((d) => d.data.name)
    const otherCategories = allCategories.filter((cat) => !(cat in predefinedColors))
    const ordinal = d3
      .scaleOrdinal<string, string>()
      .domain(otherCategories)
      .range(palette.slice(2))

    // Compute maximum metric per category for shading.
    const categoryMax: Record<string, number> = {}
    ;(root.children || []).forEach((catNode) => {
      let maxVal = 0
      const leaves = catNode.leaves()
      leaves.forEach((leaf) => {
        maxVal = Math.max(maxVal, leaf.data[sizeMetric] || 0)
      })
      categoryMax[catNode.data.name] = maxVal
    })

    // Use data join on cell groups. Use a key function based on id or name.
    const cells = g
      .selectAll('g.cell')
      .data(root.descendants(), (d: any) => (d.data.id != null ? d.data.id : d.data.name))
    cells.exit().remove()
    const cellsEnter = cells
      .enter()
      .append('g')
      .attr('class', (d) => (d.children ? 'node cell' : 'leaf cell'))
      .style('cursor', (d) => (d.children ? 'default' : 'pointer'))
      .on('click', (event, d) => {
        if (!d.children && d.data.url) {
          window.open(d.data.url, '_blank')
        }
      })
      .on('mouseover', (event, d) => {
        if (!d.children && tooltipRef.current) {
          d3
            .select(tooltipRef.current)
            .style('opacity', 1)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY + 10}px`).html(`
              <div class="font-bold text-sm mb-2">${d.data.name}</div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-gray-600 mr-3">Total Clicks:</span>
                <span class="font-medium">${d.data.clicks?.toLocaleString()}</span>
              </div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-gray-600 mr-3">Unique Clicks:</span>
                <span class="font-medium">${d.data.uniqueClicks?.toLocaleString()}</span>
              </div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-gray-600 mr-3">Click Rate:</span>
                <span class="font-medium">${d.data.clickRate}%</span>
              </div>
            `)
        }
      })
      .on('mouseout', () => {
        if (tooltipRef.current) {
          d3.select(tooltipRef.current).style('opacity', 0)
        }
      })

    const cellMerge = cellsEnter.merge(cells).attr('transform', (d) => `translate(${d.x0},${d.y0})`)

    // Use data join for the rectangle in each cell.
    const rects = cellMerge.selectAll('rect').data((d) => [d])
    rects.exit().remove()
    rects
      .enter()
      .append('rect')
      .merge(rects)
      .attr('width', (d) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d) => Math.max(0, d.y1 - d.y0))
      .attr('fill', (d) => {
        if (d.children) return 'rgba(255,255,255,0.1)'
        const cat = d.parent?.data.name || 'Uncategorized'
        const baseColor = predefinedColors[cat] || ordinal(cat)
        const maxVal = categoryMax[cat] || 1
        return getShade(baseColor, d.data[sizeMetric] || 0, maxVal)
      })
      .attr('stroke', '#fff')

    // Data join for cell title text.
    const titles = cellMerge.selectAll('text.title').data((d) => [d])
    titles.exit().remove()
    titles
      .enter()
      .append('text')
      .attr('class', 'title')
      .merge(titles)
      .attr('x', 5)
      .attr('y', 11)
      .attr('dy', '.35em')
      .text((d) => d.data.name)
      .attr('font-size', '12px')
      .attr('fill', (d) => (d.depth === 1 ? '#fff' : '#fff'))
      .style('pointer-events', 'none')
      .each(function (d) {
        const self = d3.select(this)
        let text = self.text()
        let textLength = self.node()?.getComputedTextLength() || 0
        const availWidth = d.x1 - d.x0
        while (textLength > availWidth - 10 && text.length > 1) {
          text = text.slice(0, -1)
          self.text(text + '...')
          textLength = self.node()?.getComputedTextLength() || 0
        }
      })

    // Data join for cell metric value text (only on leaves).
    const values = cellMerge.selectAll('text.value').data((d) => (!d.children ? [d] : []))
    values.exit().remove()
    values
      .enter()
      .append('text')
      .attr('class', 'value')
      .merge(values)
      .attr('x', 5)
      .attr('y', 35)
      .attr('dy', '.35em')
      .text((d) => {
        const value = d.data[sizeMetric]
        return sizeMetric === 'clickRate' ? `${value}%` : value?.toLocaleString()
      })
      .attr('font-size', '10px')
      .attr('fill', '#fff')
      .style('pointer-events', 'none')

    // Set up zoom behavior with custom wheelDelta.
    let lastTransform: d3.ZoomTransform | null = null
    ;(svg as d3.Selection<SVGSVGElement, unknown, null, undefined>).call(
      d3
        .zoom<SVGSVGElement, unknown>()
        .filter(() => true)
        .wheelDelta((event: WheelEvent) => {
          let factor = 1
          if (event.deltaMode === 0) {
            factor = 0.2
          } else if (event.deltaMode === 1) {
            factor = 40
          } else if (event.deltaMode === 2) {
            factor = 800
          }
          return -event.deltaY * factor
        })
        .scaleExtent([1, 8])
        .on('zoom', (event) => {
          lastTransform = event.transform
          requestAnimationFrame(() => {
            if (lastTransform) {
              g.attr('transform', lastTransform.toString())
            }
          })
        }),
    )
  }, [hierarchyData])

  return (
    <div className="flex flex-col w-full h-full">
      <div className="relative flex-1 overflow-hidden">
        <svg ref={svgRef} className="w-full h-full block" />
        <div
          ref={tooltipRef}
          className="absolute p-3 bg-white bg-opacity-95 border border-gray-300 rounded shadow-lg pointer-events-none opacity-0 transition-opacity duration-200 z-10 max-w-xs"
        />
      </div>
    </div>
  )
}
