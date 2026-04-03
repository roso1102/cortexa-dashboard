"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type TunnelGraphRenderNode = {
  id: string;
  label: string;
  snippet?: string;
  sourceType?: string;
  tags?: string[];
  kind?: "memory" | "tag";
  memoryHref?: string;
  externalUrl?: string;
  details?: string;
};

export type TunnelGraphEdgeLink = {
  id: string;
  source: string;
  target: string;
  fromMemoryId?: string;
  toMemoryId?: string;
  rationale: string;
  weight: number;
  bridgeScore: number;
};

type TunnelGraphProps = {
  nodes: TunnelGraphRenderNode[];
  links: TunnelGraphEdgeLink[];
  height?: number;
  onEdgeSelect?: (edge: TunnelGraphEdgeLink | null) => void;
  onEdgeHover?: (edge: TunnelGraphEdgeLink | null) => void;
};

type SimNode = TunnelGraphRenderNode & {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  fixed: boolean;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function edgeDistanceSquared(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const abx = bx - ax;
  const aby = by - ay;
  const apx = px - ax;
  const apy = py - ay;
  const abLenSq = abx * abx + aby * aby;
  if (abLenSq <= 0.0001) return apx * apx + apy * apy;
  const t = clamp((apx * abx + apy * aby) / abLenSq, 0, 1);
  const cx = ax + abx * t;
  const cy = ay + aby * t;
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy;
}

export function TunnelGraph({ nodes, links, height = 560, onEdgeSelect, onEdgeHover }: TunnelGraphProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const worldRef = useRef<{ nodes: SimNode[]; links: Array<{ id: string; source: number; target: number }> }>({
    nodes: [],
    links: [],
  });
  const transformRef = useRef({ zoom: 1, panX: 0, panY: 0 });
  const dragRef = useRef<{ type: "node" | "pan"; nodeIndex?: number; pointerId: number; lastX: number; lastY: number; startX: number; startY: number; moved: boolean } | null>(null);
  const [hint, setHint] = useState("Drag nodes to explore. Scroll to zoom. Drag empty space to pan. Click edges to see why.");
  const [size, setSize] = useState({ width: 900, height });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodes.find((node) => node.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  const prepared = useMemo(() => {
    const indexed = new Map<string, number>();
    const simNodes: SimNode[] = nodes.map((node, idx) => {
      indexed.set(node.id, idx);
      const angle = (idx / Math.max(nodes.length, 1)) * Math.PI * 2;
      const kind = node.kind || "memory";
      const radius = kind === "tag" ? 4 : 6;
      const spread = 80 + (idx % 7) * 24;
      return {
        ...node,
        x: Math.cos(angle) * spread,
        y: Math.sin(angle) * spread,
        vx: 0,
        vy: 0,
        radius,
        fixed: false,
      };
    });

    const simLinks = links
      .map((link) => ({
        id: link.id,
        source: indexed.get(link.source),
        target: indexed.get(link.target),
      }))
      .filter(
        (link): link is { id: string; source: number; target: number } =>
          link.source !== undefined && link.target !== undefined,
      );

    return { simNodes, simLinks };
  }, [links, nodes]);

  useEffect(() => {
    worldRef.current = {
      nodes: prepared.simNodes.map((n) => ({ ...n })),
      links: [...prepared.simLinks],
    };
  }, [prepared]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const resize = () => {
      const rect = el.getBoundingClientRect();
      setSize({ width: Math.max(360, Math.floor(rect.width)), height });
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    return () => observer.disconnect();
  }, [height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.floor(size.width * dpr);
    canvas.height = Math.floor(size.height * dpr);
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (transformRef.current.panX === 0 && transformRef.current.panY === 0) {
      transformRef.current.panX = size.width / 2;
      transformRef.current.panY = size.height / 2;
    }

    let frame = 0;
    let raf = 0;

    const physicsStep = () => {
      const world = worldRef.current;
      const simNodes = world.nodes;
      const simLinks = world.links;

      for (let i = 0; i < simNodes.length; i += 1) {
        for (let j = i + 1; j < simNodes.length; j += 1) {
          const a = simNodes[i];
          const b = simNodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distSq = Math.max(36, dx * dx + dy * dy);
          const force = 1300 / distSq;
          const fx = (dx / Math.sqrt(distSq)) * force;
          const fy = (dy / Math.sqrt(distSq)) * force;
          a.vx -= fx;
          a.vy -= fy;
          b.vx += fx;
          b.vy += fy;
        }
      }

      for (const link of simLinks) {
        const source = simNodes[link.source];
        const target = simNodes[link.target];
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const targetLength = source.kind === "tag" || target.kind === "tag" ? 80 : 120;
        const tension = (distance - targetLength) * 0.006;
        const fx = (dx / distance) * tension;
        const fy = (dy / distance) * tension;
        source.vx += fx;
        source.vy += fy;
        target.vx -= fx;
        target.vy -= fy;
      }

      for (const node of simNodes) {
        node.vx += (-node.x) * 0.0009;
        node.vy += (-node.y) * 0.0009;

        if (!node.fixed) {
          node.x += node.vx;
          node.y += node.vy;
        }

        node.vx *= 0.9;
        node.vy *= 0.9;
      }
    };

    const draw = () => {
      const world = worldRef.current;
      const simNodes = world.nodes;
      const simLinks = world.links;
      const { zoom, panX, panY } = transformRef.current;

      ctx.clearRect(0, 0, size.width, size.height);

      ctx.fillStyle = "#11151b";
      ctx.fillRect(0, 0, size.width, size.height);

      ctx.save();
      ctx.translate(panX, panY);
      ctx.scale(zoom, zoom);

      for (const link of simLinks) {
        const source = simNodes[link.source];
        const target = simNodes[link.target];

        const selected = selectedEdgeId === link.id;
        const hovered = hoveredEdgeId === link.id;
        ctx.strokeStyle = selected
          ? "rgba(255,255,255,0.95)"
          : hovered
            ? "rgba(200,230,255,0.9)"
            : "rgba(213,222,236,0.36)";
        ctx.lineWidth = (selected ? 2.2 : hovered ? 1.6 : 1) / zoom;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      }

      for (const node of simNodes) {
        const kind = node.kind || "memory";
        const fill = kind === "tag" ? "#f19783" : "#4f90c2";

        ctx.beginPath();
        ctx.fillStyle = fill;
        ctx.arc(node.x, node.y, node.radius / zoom, 0, Math.PI * 2);
        ctx.fill();

        if (selectedNodeId === node.id) {
          ctx.beginPath();
          ctx.strokeStyle = "rgba(255,255,255,0.9)";
          ctx.lineWidth = 1.5 / zoom;
          ctx.arc(node.x, node.y, (node.radius + 4) / zoom, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = "rgba(236,241,249,0.9)";
        ctx.font = `${12 / zoom}px var(--font-manrope)`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(node.label, node.x, node.y + (node.radius + 4) / zoom);
      }

      ctx.restore();
    };

    const tick = () => {
      frame += 1;
      physicsStep();
      draw();
      raf = window.requestAnimationFrame(tick);
    };

    tick();
    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, [size, selectedNodeId]);

  const toWorld = (screenX: number, screenY: number) => {
    const { zoom, panX, panY } = transformRef.current;
    return {
      x: (screenX - panX) / zoom,
      y: (screenY - panY) / zoom,
    };
  };

  const pickNode = (screenX: number, screenY: number): number | null => {
    const worldPos = toWorld(screenX, screenY);
    const simNodes = worldRef.current.nodes;
    for (let i = simNodes.length - 1; i >= 0; i -= 1) {
      const n = simNodes[i];
      const dx = worldPos.x - n.x;
      const dy = worldPos.y - n.y;
      if (dx * dx + dy * dy <= (n.radius + 6) * (n.radius + 6)) {
        return i;
      }
    }
    return null;
  };

  const pickEdge = (screenX: number, screenY: number): string | null => {
    const worldPos = toWorld(screenX, screenY);
    const simNodes = worldRef.current.nodes;
    const simLinks = worldRef.current.links;
    let bestId: string | null = null;
    let bestDistance = 999999;

    for (const link of simLinks) {
      const source = simNodes[link.source];
      const target = simNodes[link.target];
      const distanceSq = edgeDistanceSquared(worldPos.x, worldPos.y, source.x, source.y, target.x, target.y);
      if (distanceSq < bestDistance) {
        bestDistance = distanceSq;
        bestId = link.id;
      }
    }

    return bestDistance <= 100 ? bestId : null;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const nodeIndex = pickNode(x, y);

    if (nodeIndex !== null) {
      const n = worldRef.current.nodes[nodeIndex];
      n.fixed = true;
      dragRef.current = { type: "node", nodeIndex, pointerId: e.pointerId, lastX: x, lastY: y, startX: x, startY: y, moved: false };
      setHint("Dragging node. Release to continue simulation.");
    } else {
      dragRef.current = { type: "pan", pointerId: e.pointerId, lastX: x, lastY: y, startX: x, startY: y, moved: false };
      setHint("Panning canvas.");
    }
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!dragRef.current || dragRef.current.pointerId !== e.pointerId) {
      const hoverEdge = pickEdge(x, y);
      setHoveredEdgeId(hoverEdge);
      onEdgeHover?.(links.find((entry) => entry.id === hoverEdge) || null);
      if (hoverEdge && !dragRef.current) {
        setHint("✨ Hover over edge to preview. Click to see detailed reasoning.");
      } else if (!dragRef.current) {
        setHint("Drag nodes to explore. Scroll to zoom. Drag empty space to pan. Click edges to see why.");
      }
      return;
    }

    const moveDx = x - dragRef.current.startX;
    const moveDy = y - dragRef.current.startY;
    if (!dragRef.current.moved && Math.hypot(moveDx, moveDy) > 3) {
      dragRef.current.moved = true;
    }

    if (dragRef.current.type === "node" && dragRef.current.nodeIndex !== undefined) {
      const worldPos = toWorld(x, y);
      const node = worldRef.current.nodes[dragRef.current.nodeIndex];
      node.x = worldPos.x;
      node.y = worldPos.y;
      node.vx = 0;
      node.vy = 0;
    } else {
      const dx = x - dragRef.current.lastX;
      const dy = y - dragRef.current.lastY;
      transformRef.current.panX += dx;
      transformRef.current.panY += dy;
      dragRef.current.lastX = x;
      dragRef.current.lastY = y;
    }

    const hoverEdge = pickEdge(x, y);
    setHoveredEdgeId(hoverEdge);
    onEdgeHover?.(links.find((entry) => entry.id === hoverEdge) || null);
  };

  const clearDrag = (pointerId: number, canvas: HTMLCanvasElement, clientX: number, clientY: number) => {
    if (!dragRef.current || dragRef.current.pointerId !== pointerId) return;
    const drag = dragRef.current;
    if (dragRef.current.type === "node" && dragRef.current.nodeIndex !== undefined) {
      const node = worldRef.current.nodes[dragRef.current.nodeIndex];
      node.fixed = false;
    }

    if (!drag.moved) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const nodeIndex = pickNode(x, y);
      if (nodeIndex !== null) {
        const clicked = worldRef.current.nodes[nodeIndex];
        setSelectedNodeId(clicked.id);
        setSelectedEdgeId(null);
        onEdgeSelect?.(null);
        onEdgeHover?.(null);
        setHint("Node selected. Use actions below to open saved content.");
      } else {
        const edgeId = pickEdge(x, y);
        if (edgeId) {
          setSelectedNodeId(null);
          setSelectedEdgeId(edgeId);
          const edge = links.find((entry) => entry.id === edgeId) || null;
          onEdgeSelect?.(edge);
          onEdgeHover?.(edge);
          setHint("✓ Edge selected. See reasoning below.");
        } else {
          setSelectedNodeId(null);
          setSelectedEdgeId(null);
          onEdgeSelect?.(null);
          onEdgeHover?.(null);
          setHint("Drag nodes to explore. Scroll to zoom. Drag empty space to pan. Click edges to see why.");
        }
      }
    }

    dragRef.current = null;
    if (drag.moved) {
      setHint("Drag nodes to explore. Scroll to zoom. Drag empty space to pan. Click edges to see why.");
    }
  };

  const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const oldZoom = transformRef.current.zoom;
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const nextZoom = clamp(oldZoom * factor, 0.45, 2.4);
    const worldBefore = toWorld(x, y);

    transformRef.current.zoom = nextZoom;
    transformRef.current.panX = x - worldBefore.x * nextZoom;
    transformRef.current.panY = y - worldBefore.y * nextZoom;
  };

  const onPointerLeave = () => {
    setHoveredEdgeId(null);
    onEdgeHover?.(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-copy-muted">
        <span>{nodes.length} nodes</span>
        <span>{hint}</span>
      </div>
      <div ref={wrapperRef} className="overflow-hidden rounded-md border border-[#243041] bg-[#11151b]">
        <canvas
          ref={canvasRef}
          className="block cursor-grab active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => clearDrag(e.pointerId, e.currentTarget, e.clientX, e.clientY)}
          onPointerCancel={(e) => clearDrag(e.pointerId, e.currentTarget, e.clientX, e.clientY)}
          onPointerLeave={onPointerLeave}
          onWheel={onWheel}
        />
      </div>
      <div className="rounded-md border border-outline bg-surface-low p-3">
        {selectedNode ? (
          <div className="space-y-3">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-copy-muted">Selected Node</div>
              <div className="text-base font-semibold text-primary">{selectedNode.label}</div>
              {selectedNode.details ? <div className="mt-1 text-xs text-copy-muted">{selectedNode.details}</div> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedNode.externalUrl ? (
                <a
                  href={selectedNode.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-sm bg-primary px-3 py-2 [font-family:var(--font-manrope)] text-xs font-bold tracking-[-0.01em] text-white hover:opacity-90"
                >
                  Open saved link
                </a>
              ) : null}
              {selectedNode.memoryHref ? (
                <a
                  href={selectedNode.memoryHref}
                  className="rounded-sm border border-outline bg-white px-3 py-2 [font-family:var(--font-manrope)] text-xs font-bold tracking-[-0.01em] text-primary hover:bg-surface"
                >
                  Open memory detail
                </a>
              ) : null}
              {!selectedNode.externalUrl && !selectedNode.memoryHref ? (
                <span className="rounded-sm border border-outline bg-white px-3 py-2 text-xs text-copy-muted">
                  No saved link on this node.
                </span>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="text-sm text-copy-muted">Click a node to see available actions.</div>
        )}
      </div>
    </div>
  );
}
