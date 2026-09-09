'use client'

import { useState } from 'react'
import { TrendingUp, BarChart3 } from 'lucide-react'

interface DataPoint {
  date: string
  reach: number // Jangkauan
  engagement: number // Engagement Rate %
}

export function PerformanceChart() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  // 7 Hari Terakhir data (matching the look of Smart Farm chart)
  const data: DataPoint[] = [
    { date: '02 Sep', reach: 68, engagement: 22 },
    { date: '03 Sep', reach: 74, engagement: 24 },
    { date: '04 Sep', reach: 65, engagement: 21 },
    { date: '05 Sep', reach: 82, engagement: 28 },
    { date: '06 Sep', reach: 79, engagement: 25 },
    { date: '07 Sep', reach: 88, engagement: 31 },
    { date: '08 Sep', reach: 94, engagement: 36 },
  ]

  const chartWidth = 700
  const chartHeight = 220
  const paddingX = 40
  const paddingY = 30

  const availableWidth = chartWidth - paddingX * 2
  const availableHeight = chartHeight - paddingY * 2

  const maxVal = 100
  const minVal = 0

  const getX = (index: number) => paddingX + (index / (data.length - 1)) * availableWidth
  const getY = (val: number) => chartHeight - paddingY - ((val - minVal) / (maxVal - minVal)) * availableHeight

  // Create SVG path for Reach (amber line)
  const reachPoints = data.map((d, i) => `${getX(i)},${getY(d.reach)}`).join(' ')
  // Create SVG path for Engagement (cyan line)
  const engPoints = data.map((d, i) => `${getX(i)},${getY(d.engagement)}`).join(' ')

  // Grid lines at 100, 75, 50, 25, 0
  const gridLevels = [100, 75, 50, 25, 0]

  return (
    <div className="rounded-2xl bg-[#151833] border border-[#23274e] p-6 shadow-lg shadow-black/20 flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base lg:text-lg font-bold text-white flex items-center gap-2">
            Performa Jangkauan & Interaksi (7 Hari Terakhir)
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Analisis efektivitas publikasi dan pertumbuhan audiens harian.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <TrendingUp className="h-3.5 w-3.5" />
            +21.4% Minggu ini
          </span>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="w-full overflow-x-auto py-2">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto min-w-[500px]"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Reach Gradient */}
            <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
            {/* Engagement Gradient */}
            <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Y-labels */}
          {gridLevels.map((lvl) => {
            const yPos = getY(lvl)
            return (
              <g key={lvl}>
                <line
                  x1={paddingX}
                  y1={yPos}
                  x2={chartWidth - paddingX}
                  y2={yPos}
                  stroke="#262b54"
                  strokeDasharray={lvl === 0 ? '0' : '4 4'}
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 10}
                  y={yPos + 4}
                  fill="#757d9f"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {lvl}
                </text>
                <text
                  x={chartWidth - paddingX + 10}
                  y={yPos + 4}
                  fill="#757d9f"
                  fontSize="10"
                  textAnchor="start"
                  fontFamily="monospace"
                >
                  {(lvl * 0.03).toFixed(1)}
                </text>
              </g>
            )
          })}

          {/* Area under curves */}
          <polygon
            points={`${getX(0)},${getY(0)} ${reachPoints} ${getX(data.length - 1)},${getY(0)}`}
            fill="url(#reachGrad)"
          />
          <polygon
            points={`${getX(0)},${getY(0)} ${engPoints} ${getX(data.length - 1)},${getY(0)}`}
            fill="url(#engGrad)"
          />

          {/* Orange/Amber Line (Reach) */}
          <polyline
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={reachPoints}
          />

          {/* Cyan Line (Engagement) */}
          <polyline
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={engPoints}
          />

          {/* Points & Hover Interactivity */}
          {data.map((d, i) => {
            const x = getX(i)
            const yReach = getY(d.reach)
            const yEng = getY(d.engagement)
            const isHovered = activeIdx === i

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
              >
                {/* Vertical hover guide */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={paddingY}
                    x2={x}
                    y2={chartHeight - paddingY}
                    stroke="#ffffff"
                    strokeOpacity="0.2"
                    strokeDasharray="2 2"
                    strokeWidth="1.5"
                  />
                )}

                {/* Reach Point (Amber) */}
                <circle
                  cx={x}
                  cy={yReach}
                  r={isHovered ? '6' : '4'}
                  fill="#f59e0b"
                  stroke="#151833"
                  strokeWidth="2"
                  className="transition-all"
                />

                {/* Engagement Point (Cyan) */}
                <circle
                  cx={x}
                  cy={yEng}
                  r={isHovered ? '6' : '4'}
                  fill="#38bdf8"
                  stroke="#151833"
                  strokeWidth="2"
                  className="transition-all"
                />

                {/* X-axis Date label */}
                <text
                  x={x}
                  y={chartHeight - 8}
                  fill={isHovered ? '#ffffff' : '#8890b5'}
                  fontSize="11"
                  fontWeight={isHovered ? 'bold' : 'normal'}
                  textAnchor="middle"
                >
                  {d.date}
                </text>

                {/* Tooltip on active */}
                {isHovered && (
                  <g>
                    <rect
                      x={x - 45}
                      y={yReach - 42}
                      width="90"
                      height="32"
                      rx="6"
                      fill="#0d0f22"
                      stroke="#353b70"
                      strokeWidth="1"
                    />
                    <text
                      x={x}
                      y={yReach - 28}
                      fill="#f59e0b"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      Reach: {d.reach}k
                    </text>
                    <text
                      x={x}
                      y={yReach - 16}
                      fill="#38bdf8"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      Rate: {(d.engagement * 0.1).toFixed(1)}%
                    </text>
                  </g>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Chart Legend (Matching Smart Farm center legend) */}
      <div className="flex items-center justify-center gap-8 pt-3 border-t border-[#23274e]/60 mt-2">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
          <span className="text-xs font-semibold text-muted-foreground">Jangkauan (Reach)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#38bdf8] shadow-sm shadow-[#38bdf8]/50" />
          <span className="text-xs font-semibold text-muted-foreground">Engagement Rate (%)</span>
        </div>
      </div>
    </div>
  )
}
