import { useRef, useState } from "react";
import { Glass, type GlassOptics } from "@samasante/liquid-glass";

const CANVAS_OPTICS: Partial<GlassOptics> = {
  mapSize: 512,
  clipToShape: true,
  softEdge: true,
  strength: 0.22,
  depth: 0.85,
  curvature: 0.6,
  bend: 0.45,
  bendWidth: 0.1,
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

/** Generative contour/flow line scene — drawn each frame via the `draw` prop */
const draw = (ctx: CanvasRenderingContext2D, t: number) => {
  const { width: W, height: H } = ctx.canvas;
  ctx.fillStyle = "#0d0d0d";
  ctx.fillRect(0, 0, W, H);

  const lineCount = 36;
  ctx.lineWidth = 0.7;

  for (let i = 0; i < lineCount; i++) {
    const frac = i / lineCount;
    // alternate colour for texture
    const alpha = 0.18 + 0.1 * Math.sin(frac * Math.PI);
    ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 2) {
      const phase = (x / W) * Math.PI * 6;
      const slow = t * 0.0003;
      // layered sine waves create flowing contour lines
      const y =
        frac * H +
        Math.sin(phase + slow + frac * 3.2) * 14 +
        Math.sin(phase * 0.5 + slow * 1.3 + frac * 2.1) * 9 +
        Math.sin(phase * 0.25 + slow * 0.7 + frac * 1.4) * 6;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
};

export function GlassCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [center, setCenter] = useState({ x: 0.5, y: 0.5 });

  const onMouseMove = (e: React.MouseEvent) => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    setCenter({
      x: (e.clientX - r.left) / r.width,
      y: (e.clientY - r.top) / r.height,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={onMouseMove}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", borderRadius: "inherit", cursor: "crosshair" }}
    >
      <Glass
        draw={draw}
        size={180}
        radius={90}
        center={center}
        optics={CANVAS_OPTICS}
        live
        style={{ position: "absolute", inset: 0 }}
      />
    </div>
  );
}
