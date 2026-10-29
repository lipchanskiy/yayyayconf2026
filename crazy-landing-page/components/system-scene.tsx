"use client"

import { useEffect, useRef, useState } from "react"
import { Minus, Pause, Play, Plus, RotateCcw } from "lucide-react"
import type { Architecture } from "@/lib/architecture"

type Props = {
  architecture: Architecture
  progress: number
  selected: string
  onSelect: (id: string) => void
  running: boolean
  reducedMotion: boolean
}
type Vec = [number, number, number]
type Projected = { x: number; y: number; z: number; scale: number }

const positions: Vec[] = [
  [-180, 55, -100],
  [-145, 20, 110],
  [5, 100, -180],
  [0, 45, 0],
  [170, 65, -80],
  [140, 0, 135],
  [-35, -55, 165],
  [205, -45, 30],
  [-220, -45, -40],
  [65, 145, 100],
  [-75, 140, -90],
  [30, -60, -180],
]

export default function SystemScene(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const data = useRef(props)
  const view = useRef({ yaw: -0.45, pitch: 0.47, zoom: 1, dirty: true })
  const hitTargets = useRef<
    { id: string; x: number; y: number; radius: number }[]
  >([])
  const drag = useRef<{ x: number; y: number; distance: number } | null>(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    data.current = props
    view.current.dirty = true
  }, [props])

  useEffect(() => {
    const canvas = canvasRef.current
    const root = rootRef.current
    if (!canvas || !root) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    let width = 1,
      height = 1,
      frame = 0,
      last = 0
    let visible = true
    const resize = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width
      height = entry.contentRect.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      view.current.dirty = true
    })
    resize.observe(root)
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      view.current.dirty = true
    })
    intersection.observe(root)

    function draw(time: number) {
      frame = requestAnimationFrame(draw)
      if (!ctx || !canvas || !visible || document.hidden || time - last < 32)
        return
      const dt = Math.min(time - last, 64)
      last = time
      const { architecture, progress, selected, running } = data.current
      const moving = !paused && !props.reducedMotion && !drag.current
      if (!moving && !view.current.dirty) return
      view.current.dirty = false
      if (moving) view.current.yaw += dt * (running ? 0.000085 : 0.000025)
      const { yaw, pitch, zoom } = view.current
      const unit = Math.min(width / 650, height / 470) * zoom
      const cy = height * 0.48
      const project = ([x, y, z]: Vec): Projected => {
        const rx = x * Math.cos(yaw) - z * Math.sin(yaw)
        const rz = x * Math.sin(yaw) + z * Math.cos(yaw)
        const ry = y * Math.cos(pitch) - rz * Math.sin(pitch)
        const depth = y * Math.sin(pitch) + rz * Math.cos(pitch)
        const perspective = 700 / (700 + depth)
        return {
          x: width / 2 + rx * unit * perspective,
          y: cy - ry * unit * perspective,
          z: depth,
          scale: unit * perspective,
        }
      }
      const path = (
        points: Vec[],
        stroke: string,
        lineWidth = 1,
        fill?: string
      ) => {
        ctx.beginPath()
        points.forEach((p, i) => {
          const q = project(p)
          if (i === 0) ctx.moveTo(q.x, q.y)
          else ctx.lineTo(q.x, q.y)
        })
        if (fill) {
          ctx.closePath()
          ctx.fillStyle = fill
          ctx.fill()
        }
        ctx.strokeStyle = stroke
        ctx.lineWidth = lineWidth
        ctx.stroke()
      }
      ctx.clearRect(0, 0, width, height)
      // Ground plane: every division is exactly 32 world units.
      for (let i = -9; i <= 9; i++) {
        const strong = i % 3 === 0
        path(
          [
            [i * 32, -100, -288],
            [i * 32, -100, 288],
          ],
          strong ? "#d6d9cc" : "#e7e9df",
          0.6
        )
        path(
          [
            [-288, -100, i * 32],
            [288, -100, i * 32],
          ],
          strong ? "#d6d9cc" : "#e7e9df",
          0.6
        )
      }
      path(
        [
          [-288, -100, 0],
          [288, -100, 0],
        ],
        "#a7ad98",
        0.8
      )
      path(
        [
          [0, -100, -288],
          [0, -100, 288],
        ],
        "#a7ad98",
        0.8
      )
      const axis = project([295, -100, 0])
      ctx.font = '9px "Geist Mono", monospace'
      ctx.fillStyle = "#7b806f"
      ctx.fillText("X", axis.x, axis.y)
      const zaxis = project([0, -100, 295])
      ctx.fillText("Z", zaxis.x, zaxis.y)

      const count = architecture.nodes.length
      const visibleCount = Math.max(1, Math.ceil(Math.max(0, progress) * count))
      const nodePositions = new Map(
        architecture.nodes.map((node, i) => [
          node.id,
          positions[i % positions.length],
        ])
      )
      const visibleIds = new Set(
        architecture.nodes.slice(0, visibleCount).map((n) => n.id)
      )
      for (const [a, b] of architecture.edges) {
        if (!visibleIds.has(a) || !visibleIds.has(b)) continue
        const pa = nodePositions.get(a)!,
          pb = nodePositions.get(b)!
        const elbow: Vec = [pb[0], pa[1], pa[2]]
        const active = a === selected || b === selected
        path(
          [pa, elbow, pb],
          active ? "#6a833b" : "#a4ab97",
          active ? 1.4 : 0.85
        )
        if (moving) {
          const t =
            (time / 2000 +
              architecture.nodes.findIndex((n) => n.id === a) * 0.17) %
            1
          const travel: Vec =
            t < 0.5
              ? [pa[0] + (elbow[0] - pa[0]) * t * 2, pa[1], pa[2]]
              : [
                  pb[0],
                  pa[1] + (pb[1] - pa[1]) * (t - 0.5) * 2,
                  pa[2] + (pb[2] - pa[2]) * (t - 0.5) * 2,
                ]
          const p = project(travel)
          ctx.fillStyle = active ? "#435527" : "#7c8869"
          ctx.fillRect(p.x - 1.7, p.y - 1.7, 3.4, 3.4)
        }
      }
      const sorted = architecture.nodes
        .slice(0, visibleCount)
        .map((node, i) => ({
          node,
          i,
          pos: positions[i % positions.length],
          projected: project(positions[i % positions.length]),
        }))
        .sort((a, b) => b.projected.z - a.projected.z)
      hitTargets.current = []
      for (const { node, i, pos, projected } of sorted) {
        const active = node.id === selected
        const central = i === 3
        const size = central ? 29 : 19
        const layers = node.kind === "data" ? 3 : central ? 2 : 1
        const [x, y, z] = pos
        ctx.setLineDash([2, 4])
        path(
          [
            [x, -100, z],
            [x, y - size, z],
          ],
          "#c3c7b7",
          0.65
        )
        ctx.setLineDash([])
        const floor = project([x, -100, z])
        ctx.beginPath()
        ctx.ellipse(
          floor.x,
          floor.y,
          8 * projected.scale,
          3 * projected.scale,
          0,
          0,
          Math.PI * 2
        )
        ctx.strokeStyle = "#bdc4ae"
        ctx.lineWidth = 0.7
        ctx.stroke()
        for (let layer = 0; layer < layers; layer++) {
          const bottom = y - size + layer * (size * 0.55)
          const top = bottom + (layers > 1 ? size * 0.6 : size * 1.6)
          const a: Vec = [x - size, bottom, z - size],
            b: Vec = [x + size, bottom, z - size]
          const c: Vec = [x + size, bottom, z + size],
            d: Vec = [x - size, bottom, z + size]
          const e: Vec = [x - size, top, z - size],
            f: Vec = [x + size, top, z - size]
          const g: Vec = [x + size, top, z + size],
            h: Vec = [x - size, top, z + size]
          const stroke = active || central ? "#39472b" : "#626c57"
          path([a, b, c, d, a], stroke, 0.8)
          path(
            [a, e, f, b],
            stroke,
            0.9,
            active || central ? "#b6d68c" : "#e4e7dc"
          )
          path(
            [b, f, g, c],
            stroke,
            0.9,
            active || central ? "#a4c771" : "#d9decf"
          )
          path(
            [c, g, h, d],
            stroke,
            0.9,
            active || central ? "#bddd8b" : "#e5e8de"
          )
          path(
            [e, f, g, h],
            stroke,
            active ? 1.4 : 0.9,
            active || central ? "#c5f266" : "#f3f5ed"
          )
          if (central) {
            path(
              [
                [x - size * 0.5, top + 0.1, z],
                [x, top + 0.1, z - size * 0.5],
                [x + size * 0.5, top + 0.1, z],
                [x, top + 0.1, z + size * 0.5],
                [x - size * 0.5, top + 0.1, z],
              ],
              "#53672f",
              1
            )
          }
        }
        const label = project([x, y - size - 12, z])
        ctx.font = `${Math.max(9, Math.min(11, 10.5 * projected.scale))}px "Geist Mono", monospace`
        const labelWidth = ctx.measureText(node.label).width + 16
        ctx.fillStyle = active ? "#20251b" : "rgba(247,248,241,0.94)"
        ctx.fillRect(label.x - labelWidth / 2, label.y, labelWidth, 20)
        ctx.fillStyle = active ? "#d5fa96" : "#4c5442"
        ctx.textAlign = "center"
        ctx.fillText(node.label, label.x, label.y + 13)
        ctx.textAlign = "start"
        if (active) {
          const top = project([x, y + size * 1.5, z])
          ctx.font = '9px "Geist Mono", monospace'
          ctx.fillStyle = "#62734c"
          ctx.textAlign = "center"
          ctx.fillText("[ SELECTED ]", top.x, top.y - 12)
          ctx.textAlign = "start"
        }
        hitTargets.current.push({
          id: node.id,
          x: projected.x,
          y: projected.y,
          radius: Math.max(24, 42 * projected.scale),
        })
        hitTargets.current.push({
          id: node.id,
          x: label.x,
          y: label.y + 10,
          radius: Math.max(24, labelWidth / 2),
        })
      }
      // Mathematical registration marks intentionally share exact coordinates.
      ctx.strokeStyle = "#a5ab99"
      ctx.lineWidth = 0.75
      for (const [cx, cy] of [
        [24, 24],
        [width - 24, 24],
        [24, height - 24],
        [width - 24, height - 24],
      ]) {
        ctx.beginPath()
        ctx.moveTo(cx - 4, cy)
        ctx.lineTo(cx + 4, cy)
        ctx.moveTo(cx, cy - 4)
        ctx.lineTo(cx, cy + 4)
        ctx.stroke()
      }
      ctx.font = '9px "Geist Mono", monospace'
      ctx.fillStyle = "#838a76"
      ctx.fillText("PERSPECTIVE / 32u", 20, height - 56)
      ctx.fillText(
        `N ${String(visibleCount).padStart(2, "0")}   E ${String(architecture.edges.filter(([a, b]) => visibleIds.has(a) && visibleIds.has(b)).length).padStart(2, "0")}`,
        20,
        52
      )
    }
    frame = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      intersection.disconnect()
    }
  }, [paused, props.reducedMotion])

  const zoom = (amount: number) => {
    view.current.zoom = Math.max(
      0.65,
      Math.min(1.65, view.current.zoom + amount)
    )
    view.current.dirty = true
  }
  const controlStyle: React.CSSProperties = {
    width: 34,
    height: 34,
    display: "grid",
    placeItems: "center",
    border: "1px solid #c9cebd",
    background: "#f7f8f1",
    color: "#30392a",
    cursor: "pointer",
    borderRadius: 0,
  }
  return (
    <div
      ref={rootRef}
      className="system-scene"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        background: "#f5f6ee",
      }}
    >
      <canvas
        ref={canvasRef}
        tabIndex={0}
        role="application"
        aria-label="Interactive 3D system architecture. Drag to rotate, use arrow keys to rotate, plus and minus to zoom, and Enter to select the next module."
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          touchAction: "pan-y",
          cursor: "grab",
        }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          drag.current = { x: e.clientX, y: e.clientY, distance: 0 }
        }}
        onPointerMove={(e) => {
          if (!drag.current) return
          const dx = e.clientX - drag.current.x,
            dy = e.clientY - drag.current.y
          view.current.yaw += dx * 0.007
          view.current.pitch = Math.max(
            0.1,
            Math.min(1.1, view.current.pitch + dy * 0.004)
          )
          view.current.dirty = true
          drag.current = {
            x: e.clientX,
            y: e.clientY,
            distance: drag.current.distance + Math.abs(dx) + Math.abs(dy),
          }
        }}
        onPointerUp={(e) => {
          if (!drag.current || drag.current.distance < 5) {
            const box = e.currentTarget.getBoundingClientRect(),
              x = e.clientX - box.left,
              y = e.clientY - box.top
            const target = [...hitTargets.current]
              .reverse()
              .find((p) => Math.hypot(p.x - x, p.y - y) < p.radius)
            if (target) props.onSelect(target.id)
          }
          drag.current = null
        }}
        onPointerCancel={() => {
          drag.current = null
        }}
        onKeyDown={(e) => {
          if (
            [
              "ArrowLeft",
              "ArrowRight",
              "ArrowUp",
              "ArrowDown",
              "+",
              "=",
              "-",
              "Enter",
            ].includes(e.key)
          )
            e.preventDefault()
          if (e.key === "ArrowLeft") view.current.yaw -= 0.15
          if (e.key === "ArrowRight") view.current.yaw += 0.15
          if (e.key === "ArrowUp")
            view.current.pitch = Math.min(1.1, view.current.pitch + 0.1)
          if (e.key === "ArrowDown")
            view.current.pitch = Math.max(0.1, view.current.pitch - 0.1)
          if (e.key === "+" || e.key === "=") zoom(0.1)
          if (e.key === "-") zoom(-0.1)
          if (e.key === "Enter") {
            const count = Math.max(
              1,
              Math.ceil(props.progress * props.architecture.nodes.length)
            )
            const index = props.architecture.nodes.findIndex(
              (n) => n.id === props.selected
            )
            props.onSelect(props.architecture.nodes[(index + 1) % count].id)
          }
          view.current.dirty = true
        }}
      >
        Your system architecture. Select a module in the inspector to view its
        code.
      </canvas>
      <div
        className="scene-controls"
        style={{
          position: "absolute",
          right: 16,
          bottom: 40,
          display: "flex",
          gap: 4,
        }}
      >
        <button
          type="button"
          style={controlStyle}
          aria-label="Zoom out"
          onClick={() => zoom(-0.15)}
        >
          <Minus size={14} aria-hidden="true" />
        </button>
        <button
          type="button"
          style={controlStyle}
          aria-label="Zoom in"
          onClick={() => zoom(0.15)}
        >
          <Plus size={14} aria-hidden="true" />
        </button>
        <button
          type="button"
          style={controlStyle}
          aria-label="Reset camera"
          onClick={() => {
            view.current = { yaw: -0.45, pitch: 0.47, zoom: 1, dirty: true }
          }}
        >
          <RotateCcw size={13} aria-hidden="true" />
        </button>
        <button
          type="button"
          style={controlStyle}
          aria-label={
            paused || props.reducedMotion
              ? "Start automatic rotation"
              : "Pause automatic rotation"
          }
          aria-pressed={!paused && !props.reducedMotion}
          disabled={props.reducedMotion}
          onClick={() => setPaused((v) => !v)}
        >
          {paused || props.reducedMotion ? (
            <Play size={13} aria-hidden="true" />
          ) : (
            <Pause size={13} aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  )
}
