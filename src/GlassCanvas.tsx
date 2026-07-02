import { useEffect, useMemo, useRef } from "react";
import { Glass, type GlassOptics, glassValue } from "@samasante/liquid-glass";

const CANVAS_OPTICS: Partial<GlassOptics> = {
  mapSize: 512,
  clipToShape: true,
  softEdge: true,
  strength: 0.22,
  depth: 0.85,
  curvature: 0.6,
  bend: 0.45,
  bendWidth: 0.9,
  dispersion: 0.35,
  specular: 1.1,
  sheenAngle: 50,
  glow: 0.2,
  glowSpread: 0.8,
  glowFalloff: 1.5,
  sheen: 0.8,
  sheenWidth: 2,
  sheenFalloff: 1.5,
  frost: 0,
  brightness: 0,
};

const draw = (ctx: CanvasRenderingContext2D, t: number) => {
  const { width: W, height: H } = ctx.canvas;
  ctx.fillStyle = "#0d0d0d";
  ctx.fillRect(0, 0, W, H);

  const lineCount = 36;
  ctx.lineWidth = 0.7;

  for (let i = 0; i < lineCount; i++) {
    const frac = i / lineCount;
    const alpha = 0.18 + 0.1 * Math.sin(frac * Math.PI);
    ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 2) {
      const phase = (x / W) * Math.PI * 6;
      const slow = t * 0.0003;
      const y =
        frac * H +
        Math.sin(phase + slow + frac * 3.2) * 14 +
        Math.sin(phase * 0.5 + slow * 1.3 + frac * 2.1) * 9 +
        Math.sin(phase * 0.25 + slow * 0.7 + frac * 1.4) * 6;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
};

export function GlassCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Use motion values so mouse moves don't cause React re-renders
  const mx = useMemo(() => glassValue(0.5), []);
  const my = useMemo(() => glassValue(0.5), []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      mx.set((e.clientX - r.left) / r.width);
      my.set((e.clientY - r.top) / r.height);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative", width: "100%", height: "100%",
        overflow: "hidden", borderRadius: "inherit", cursor: "crosshair",
      }}
    >
      <Glass
        draw={draw}
        size={180}
        radius={90}
        center={{ x: mx, y: my }}
        optics={CANVAS_OPTICS}
        live
        style={{ position: "absolute", inset: 0 }}
      />
    </div>
  );
}
