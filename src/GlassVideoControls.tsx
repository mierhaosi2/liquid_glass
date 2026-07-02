import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Glass, type GlassOptics, type GlassSurfaceLens } from "@samasante/liquid-glass";

const sans = "-apple-system, 'SF Pro Text', system-ui, sans-serif";

export const PLAYER_OPTICS: Partial<GlassOptics> = {
  mapSize: 512,
  clipToShape: true,
  softEdge: true,
  strength: 0.16,
  depth: 0.2,
  curvature: 0.55,
  bend: 0.25,
  bendWidth: 0.08,
  dispersion: 0.15,
  specular: 1,
  sheenAngle: 50,
  glow: 0.15,
  glowSpread: 1,
  glowFalloff: 1.5,
  sheen: 0.95,
  sheenWidth: 2,
  sheenFalloff: 1.5,
  frost: 3,
  brightness: 0,
};

export const SCRUB_OPTICS: Partial<GlassOptics> = {
  strength: 0.03,
  depth: 0.3,
  curvature: 0.25,
  dispersion: 0.2,
  bend: 0.05,
  bendWidth: 0.06,
  specular: 1,
  sheenAngle: 45,
  sheen: 0.35,
  sheenWidth: 3,
  sheenFalloff: 1.5,
  glow: 0.1,
  glowSpread: 1,
  glowFalloff: 1.5,
  frost: 6,
  brightness: 0,
};

const PLAY_DIA = 104;
const SKIP_DIA = 62;
const GAP = 0.23;
const SKIP_BACK_X = 0.5 - GAP;
const SKIP_FWD_X = 0.5 + GAP;
const SCRUB_INSET = 0.06;
const SCRUB_H = 26;
const SCRUB_RADIUS = 7;
const SCRUB_BOTTOM = 0.08;

const useSize = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
};

const ICON_SHADOW = "drop-shadow(0 1px 2px rgba(0,0,0,0.45))";

const ctrlStyle: React.CSSProperties = {
  position: "absolute",
  transform: "translate(-50%,-50%)",
  border: "none",
  background: "none",
  padding: 0,
  cursor: "pointer",
  color: "#fff",
  display: "grid",
  placeItems: "center",
  fontFamily: sans,
};

const SkipIcon = ({ dir, size }: { dir: 1 | -1; size: number }) => {
  const mirror = dir > 0 ? `translate(${size},0) scale(-1,1)` : undefined;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: ICON_SHADOW }}>
      <g transform={mirror}>
        <path
          d="M12 4a8 8 0 1 0 0 16A8 8 0 0 0 12 4z"
          stroke="white" strokeWidth="0" fill="none"
        />
        <path
          d="M8 12c0-3 1.5-5.5 4-7l-1.5-1.5A9 9 0 0 0 3 12h5zm0 0a4 4 0 0 0 4 4v-2a2 2 0 0 1-2-2H8z"
          fill="white" opacity="0"
        />
        <path
          fillRule="evenodd" clipRule="evenodd"
          d="M12 3.5A8.5 8.5 0 1 0 20.5 12 8.51 8.51 0 0 0 12 3.5zm-1 1.07A7.5 7.5 0 1 1 4.54 8H7V6.3A8.47 8.47 0 0 0 4 12a8 8 0 1 0 8-8 7.94 7.94 0 0 0-1-.07zM6 6v3.5h3.5V8H7.41A6 6 0 1 1 6 11.5H4.5A7.5 7.5 0 1 0 6 6z"
          fill="white" opacity="0"
        />
        {/* Circular arrow (rewind) */}
        <path
          d="M12 5a7 7 0 1 0 5.66 2.91L19 6.5 14.5 5 15 9.5l1.4-1.4A5.5 5.5 0 1 1 12 6.5V5z"
          fill="white"
        />
        <text
          x="12" y="14.5"
          textAnchor="middle" fontSize="5.5" fontWeight="700"
          fill="white" fontFamily={sans}
          transform={dir > 0 ? `translate(${size * 0},0)` : undefined}
          style={{ transform: dir > 0 ? `scaleX(-1)` : undefined }}
        >
          10
        </text>
      </g>
    </svg>
  );
};

const PlayPauseIcon = ({ playing, size }: { playing: boolean; size: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="white" style={{ filter: ICON_SHADOW }}>
    {playing ? (
      <>
        <rect x="11" y="10" width="9" height="28" rx="2" />
        <rect x="28" y="10" width="9" height="28" rx="2" />
      </>
    ) : (
      <polygon points="14,10 40,24 14,38" />
    )}
  </svg>
);

const ScrubBar = ({
  fillRef,
  onSeek,
}: {
  fillRef: React.RefObject<HTMLDivElement>;
  onSeek: (e: React.PointerEvent) => void;
}) => (
  <div
    onPointerDown={onSeek}
    style={{
      position: "absolute",
      left: `${SCRUB_INSET * 100}%`,
      right: `${SCRUB_INSET * 100}%`,
      bottom: `${SCRUB_BOTTOM * 100}%`,
      height: SCRUB_H,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
    }}
  >
    {/* track hint */}
    <div style={{ position: "absolute", inset: 0, borderRadius: SCRUB_RADIUS, background: "rgba(255,255,255,0.15)" }} />
    {/* progress fill */}
    <div
      ref={fillRef}
      style={{
        position: "absolute",
        left: 0, top: 0, bottom: 0,
        width: "0%",
        borderRadius: SCRUB_RADIUS,
        background: "rgba(255,255,255,0.9)",
        pointerEvents: "none",
      }}
    />
  </div>
);

export interface GlassVideoControlsProps {
  src: string;
  lens?: Partial<GlassOptics>;
  trackLens?: Partial<GlassOptics>;
}

export const GlassVideoControls: React.FC<GlassVideoControlsProps> = ({
  src,
  lens,
  trackLens,
}) => {
  const [playing, setPlaying] = useState(true);
  const [ref, { w, h }] = useSize();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const v = videoRef.current, fill = fillRef.current;
      if (v && fill && v.duration > 0)
        fill.style.width = `${(v.currentTime / v.duration) * 100}%`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const seek = (e: React.PointerEvent) => {
    const v = videoRef.current;
    if (!v || !(v.duration > 0)) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    v.currentTime = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * v.duration;
  };

  const skipBy = (d: number) => {
    const v = videoRef.current;
    if (v && v.duration > 0)
      v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + d));
  };

  const lenses: GlassSurfaceLens[] = [
    { x: 0.5, y: 0.5, w: PLAY_DIA, h: PLAY_DIA, radius: PLAY_DIA / 2 },
    { x: SKIP_BACK_X, y: 0.5, w: SKIP_DIA, h: SKIP_DIA, radius: SKIP_DIA / 2 },
    { x: SKIP_FWD_X, y: 0.5, w: SKIP_DIA, h: SKIP_DIA, radius: SKIP_DIA / 2 },
  ];

  if (w > 0 && h > 0) {
    lenses.push({
      x: 0.5,
      y: 1 - SCRUB_BOTTOM - SCRUB_H / 2 / h,
      w: w * (1 - 2 * SCRUB_INSET),
      h: SCRUB_H,
      radius: SCRUB_RADIUS,
      optics: { ...SCRUB_OPTICS, ...trackLens },
    });
  }

  return (
    <div
      ref={ref}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", borderRadius: "inherit", background: "#000" }}
    >
      <Glass
        src={src}
        optics={{ ...PLAYER_OPTICS, ...lens }}
        lenses={lenses}
        videoRef={videoRef}
        paused={!playing}
        loop
        muted
        autoPlay
        style={{ position: "absolute", inset: 0 }}
      >
        <button
          onClick={() => skipBy(-10)}
          style={{ ...ctrlStyle, left: `${SKIP_BACK_X * 100}%`, top: "50%", width: SKIP_DIA, height: SKIP_DIA }}
        >
          <SkipIcon dir={-1} size={32} />
        </button>
        <button
          onClick={() => setPlaying(p => !p)}
          style={{ ...ctrlStyle, left: "50%", top: "50%", width: PLAY_DIA, height: PLAY_DIA }}
        >
          <PlayPauseIcon playing={playing} size={48} />
        </button>
        <button
          onClick={() => skipBy(10)}
          style={{ ...ctrlStyle, left: `${SKIP_FWD_X * 100}%`, top: "50%", width: SKIP_DIA, height: SKIP_DIA }}
        >
          <SkipIcon dir={1} size={32} />
        </button>
        <ScrubBar fillRef={fillRef} onSeek={seek} />
      </Glass>
    </div>
  );
};
