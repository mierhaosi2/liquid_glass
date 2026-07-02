import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Glass,
  type GlassOptics,
  animateGlassValue,
  cubicBezier,
  deriveGlass,
  glassValue,
  rubberBand,
  useLensWobble,
} from "@samasante/liquid-glass";

const EXPAND_ANIM = { ease: cubicBezier(0.34, 1.36, 0.42, 1), duration: 0.22 };
const COLLAPSE_ANIM = { ease: cubicBezier(0.36, 0, 0.18, 1), duration: 0.38 };

const OPTICS: Partial<GlassOptics> = {
  mapSize: 256,
  depth: 0.2,
  dispersion: 0.5,
  scaleX: 0.1,
  scaleY: 0.1,
  clipToShape: true,
  softEdge: true,
  curvature: 0.55,
  splay: 0.5,
  bend: 0.1,
  bendWidth: 0.05,
  frost: 0,
  brightness: 0.06,
  specular: 1.5,
  sheenAngle: 45,
  sheenDark: false,
  glow: 0.4,
  glowSpread: 0.5,
  glowFalloff: 1.5,
  sheen: 0,
  sheenWidth: 3,
  sheenFalloff: 1.5,
  edgeShadow: "0 2px 6px rgba(0,0,0,0.16)",
  edgeInsetShadow: "0 -4px 10px rgba(0,0,0,0.12)",
  restEdgeShadow: "0 1px 4px rgba(0,0,0,0.45)",
};

export interface GlassSliderProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  width?: number;
  thumbHeight?: number;
  thumbWidth?: number;
  height?: number;
  activeColor?: string;
  trackColor?: string;
  surface?: string;
  filterResolution?: number;
}

export function GlassSlider({
  value,
  defaultValue = 60,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  width: trackW = 240,
  thumbHeight: thumbH = 22,
  thumbWidth,
  height: trackH = 5,
  activeColor = "#0a84ff",
  trackColor,
  surface,
  filterResolution = 2,
}: GlassSliderProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const cur = isControlled ? value! : internal;

  const commit = useCallback((raw: number) => {
    const snapped = step > 0 ? Math.round((raw - min) / step) * step + min : raw;
    const clamped = Math.max(min, Math.min(max, snapped));
    if (!isControlled) setInternal(clamped);
    onValueChange?.(clamped);
  }, [min, max, step, isControlled, onValueChange]);

  const thumbW = thumbWidth ?? Math.round(2 * thumbH);
  const travel = trackW - thumbW;
  const restHalfW = thumbW / 2;
  const restHalfH = thumbH / 2;
  const restRadius = thumbH / 2;
  const trackRadius = trackH / 2;
  const refractionH = Math.round(0.75 * thumbH);
  const RUBBER_LIMIT = trackW * 0.05;
  const RUBBER_RANGE = RUBBER_LIMIT * 30;
  const pad = Math.ceil(restHalfW * 0.5 + RUBBER_LIMIT) + 2;
  const fullW = trackW + 2 * pad;
  const fullH = thumbH + 2 * pad;

  const travelRef = useRef(travel);
  const thumbWRef = useRef(thumbW);
  const fullWRef = useRef(fullW);
  const padRef = useRef(pad);
  const restHalfWRef = useRef(restHalfW);
  const restHalfHRef = useRef(restHalfH);
  const restRadiusRef = useRef(restRadius);
  useEffect(() => {
    travelRef.current = travel;
    thumbWRef.current = thumbW;
    fullWRef.current = fullW;
    padRef.current = pad;
    restHalfWRef.current = restHalfW;
    restHalfHRef.current = restHalfH;
    restRadiusRef.current = restRadius;
  });

  const valueToX = useCallback(
    (v: number) => (max > min ? ((v - min) / (max - min)) * travel : 0),
    [min, max, travel],
  );

  const valueToXRef = useRef(valueToX);
  const initialValueRef = useRef(cur);

  const mv = useMemo(() => {
    const thumbX = glassValue(valueToXRef.current(initialValueRef.current));
    const lensX = deriveGlass(
      [thumbX],
      () => (padRef.current + thumbWRef.current / 2 + thumbX.get()) / fullWRef.current,
    );
    const halfW = glassValue(restHalfW);
    const halfH = glassValue(restHalfH);
    const radius = glassValue(restRadius);
    const tintOpacity = glassValue(1);
    const shadowOpacity = glassValue(0);
    const restShadowOpacity = deriveGlass([shadowOpacity], () => 1 - shadowOpacity.get());
    const stretch = glassValue(0);
    const lensW = deriveGlass([halfW, stretch], () => halfW.get() * (1 - 0.2 * stretch.get()) * 2);
    const lensH = deriveGlass([halfH, stretch], () => halfH.get() * (1 + 0.4 * stretch.get()) * 2);
    return { thumbX, lensX, halfW, halfH, radius, tintOpacity, shadowOpacity, restShadowOpacity, stretch, lensW, lensH };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const holdRef = useRef(0);
  const kickWobbleRef = useRef<() => void>(() => {});
  useLensWobble(mv.thumbX, mv.stretch, holdRef, kickWobbleRef);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const visibleFillRef = useRef<HTMLDivElement>(null);
  const refractFillRef = useRef<HTMLDivElement>(null);
  const pointerIdRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const startClientXRef = useRef(0);
  const startThumbXRef = useRef(0);

  // drive both fill layers imperatively — no CSS variable (it won't cascade into refract)
  useLayoutEffect(() => {
    const apply = (x: number) => {
      const w = `${thumbWRef.current / 2 + x}px`;
      if (visibleFillRef.current) visibleFillRef.current.style.width = w;
      if (refractFillRef.current) refractFillRef.current.style.width = w;
    };
    apply(mv.thumbX.get());
    return mv.thumbX.on("change", apply);
  }, [mv.thumbX]);

  // sync thumb with external value
  useEffect(() => {
    if (!draggingRef.current) mv.thumbX.set(valueToX(cur));
  }, [cur, valueToX, mv.thumbX]);

  const expand = () => {
    animateGlassValue(mv.halfW, 1.5 * restHalfWRef.current, EXPAND_ANIM);
    animateGlassValue(mv.halfH, 1.5 * restHalfHRef.current, EXPAND_ANIM);
    animateGlassValue(mv.radius, 1.5 * restRadiusRef.current, EXPAND_ANIM);
    animateGlassValue(mv.tintOpacity, 0, EXPAND_ANIM);
    animateGlassValue(mv.shadowOpacity, 1, EXPAND_ANIM);
  };

  const collapse = () => {
    animateGlassValue(mv.halfW, restHalfWRef.current, COLLAPSE_ANIM);
    animateGlassValue(mv.halfH, restHalfHRef.current, COLLAPSE_ANIM);
    animateGlassValue(mv.radius, restRadiusRef.current, COLLAPSE_ANIM);
    animateGlassValue(mv.tintOpacity, 1, COLLAPSE_ANIM);
    animateGlassValue(mv.shadowOpacity, 0, COLLAPSE_ANIM);
  };

  const xToValue = useCallback((x: number) => {
    const clamped = Math.max(0, Math.min(travelRef.current, x));
    const raw = travelRef.current > 0 ? min + (clamped / travelRef.current) * (max - min) : min;
    return step > 0 ? Math.round((raw - min) / step) * step + min : raw;
  }, [min, max, step]);

  const endDrag = (e: React.PointerEvent) => {
    if (e.pointerId !== pointerIdRef.current) return;
    pointerIdRef.current = null;
    draggingRef.current = false;
    holdRef.current = 0;
    const settled = Math.max(0, Math.min(travelRef.current, mv.thumbX.get()));
    animateGlassValue(mv.thumbX, settled, COLLAPSE_ANIM);
    collapse();
  };

  const bg = surface ?? "#ffffff";
  const track = trackColor ?? "#e1dfdf";
  const active = activeColor;

  // Refract copy — fill width driven by refractFillRef imperatively (CSS vars don't cascade here)
  const TrackCopy = (
    <div style={{ position: "absolute", inset: 0, background: bg }}>
      <div style={{
        position: "absolute", top: "50%", left: pad, right: pad,
        height: refractionH, borderRadius: trackRadius,
        background: track, transform: "translateY(-50%)",
      }} />
      <div
        ref={refractFillRef}
        style={{
          position: "absolute", top: "50%", left: pad,
          width: 0,
          height: refractionH, borderRadius: trackRadius,
          background: active, transform: "translateY(-50%)",
        }}
      />
    </div>
  );

  return (
    <div ref={wrapperRef} style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      {/* hidden accessible input */}
      <input
        ref={inputRef}
        type="range"
        min={min} max={max} step={step}
        value={cur}
        onChange={e => commit(Number(e.target.value))}
        disabled={disabled}
        style={{
          position: "absolute", width: 1, height: 1, margin: -1,
          padding: 0, border: 0, overflow: "hidden",
          clip: "rect(0 0 0 0)", clipPath: "inset(50%)", pointerEvents: "none",
        }}
      />

      {/* overflow-visible bleed container */}
      <div style={{ position: "relative", width: fullW, height: fullH, margin: `-${pad}px` }}>
        {/* visible gray track */}
        <div style={{
          position: "absolute", top: "50%",
          left: pad, right: pad, height: trackH,
          borderRadius: trackRadius, background: track,
          transform: "translateY(-50%)",
        }} />
        {/* blue fill — width driven by visibleFillRef */}
        <div
          ref={visibleFillRef}
          style={{
            position: "absolute", top: "50%", left: pad,
            width: 0, height: trackH,
            borderRadius: trackRadius, background: active,
            transform: "translateY(-50%)",
          }}
        />

        {/* Glass thumb */}
        <Glass
          refract={TrackCopy}
          behind={bg}
          width={mv.lensW}
          height={mv.lensH}
          radius={mv.radius}
          center={{ x: mv.lensX, y: 0.5 }}
          optics={OPTICS}
          filterResolution={filterResolution}
          unstable_lens={{
            tintColor: "#ffffff",
            tintOpacity: mv.tintOpacity,
            shadowOpacity: mv.shadowOpacity,
            restShadowOpacity: mv.restShadowOpacity,
          }}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        />

        {/* drag hit area */}
        <div
          ref={rootRef}
          style={{ position: "absolute", inset: 0, cursor: disabled ? "not-allowed" : "pointer" }}
          onPointerDown={(e) => {
            if (disabled || pointerIdRef.current !== null) return;
            pointerIdRef.current = e.pointerId;
            e.currentTarget.setPointerCapture(e.pointerId);
            draggingRef.current = true;
            inputRef.current?.focus({ preventScroll: true });
            const rect = rootRef.current?.getBoundingClientRect();
            const raw = rect ? e.clientX - rect.left - pad - thumbWRef.current / 2 : 0;
            const x = Math.max(0, Math.min(travelRef.current, raw));
            mv.thumbX.set(x);
            commit(xToValue(x));
            startClientXRef.current = e.clientX;
            startThumbXRef.current = x;
            expand();
            holdRef.current = 0.175;
            kickWobbleRef.current();
          }}
          onPointerMove={(e) => {
            if (e.pointerId !== pointerIdRef.current) return;
            let x = startThumbXRef.current + (e.clientX - startClientXRef.current);
            if (x < 0) x = -rubberBand(-x, RUBBER_LIMIT, RUBBER_RANGE);
            else if (x > travelRef.current) x = travelRef.current + rubberBand(x - travelRef.current, RUBBER_LIMIT, RUBBER_RANGE);
            mv.thumbX.set(x);
            commit(xToValue(Math.max(0, Math.min(travelRef.current, x))));
          }}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onDragStart={e => e.preventDefault()}
        />
      </div>
    </div>
  );
}
