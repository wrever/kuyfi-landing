/**
 * Hero scroll timeline — pure functions from scroll progress `p` (0 → 1 across the hero rig)
 * to visual values. Ported from the `apply()` function of the Kuyfi_landing_v2 prototype and kept
 * numerically close on purpose, so the dive feels the same.
 *
 * Division of labour (intentional):
 *   VIDEO  = motion inside the scene (native <video>, never scrubbed by scroll)
 *   SCROLL = camera: scale, position, crossfade, bloom, copy opacity/translation
 */

export const clamp01 = (x: number): number => Math.min(1, Math.max(0, x))

const smoothstep = (t: number): number => t * t * (3 - 2 * t)

/**
 * The rig is longer than the dive itself. Scroll progress `v` (0 → 1 over the whole rig) is split:
 *   v in [0, DIVE_END]  → the dive, as dive progress p = v / DIVE_END (0 → 1). Same pixels per unit
 *                          of p as the original 110svh dive, so the mid-scroll feel is unchanged.
 *   v in [DIVE_END, 1]  → the exit: the light dims and ink returns (see exitTint / exitInk).
 * CSS keeps them in sync: desktop rig 241svh (110 / 0.78 = 141svh of scroll), portrait 228svh.
 */
export const DIVE_END = 0.78
export const diveProgress = (v: number): number => clamp01(v / DIVE_END)

/**
 * Exit, as functions of raw rig progress `v`. Darkening gold always turns olive, so the light does
 * not simply fade: a plum tint takes over first (gold → terracotta → plum), then ink #0E1113.
 * The tint starts right where the bloom finishes, so the flood is a peak, never a flat plateau.
 */
export const exitTint = (v: number): number => clamp01((v - 0.7) / 0.2)
export const exitInk = (v: number): number => smoothstep(clamp01((v - 0.86) / 0.14))

/** Camera scale at the end of the dive (v2: 1 + 3.4). */
export const DIVE_MAX = 4.4

/** Camera zoom: eased-in, 1 → DIVE_MAX. (v2: 1 + p^1.45 · 3.4) */
export const dive = (p: number, max: number = DIVE_MAX): number =>
  1 + Math.pow(clamp01(p), 1.45) * (max - 1)

/** Giant KUYFI wordmark: fades out by p = 0.5 while drifting up 28vh. */
export const wordmarkOpacity = (p: number): number => clamp01(1 - p / 0.5)
export const wordmarkShift = (p: number): number => -clamp01(p) * 28 // vh

/** Copy block: fades out earlier than the dive completes (p = 0.4), with a subtle upward drift. */
export const copyOpacity = (p: number): number => clamp01(1 - p / 0.4)
export const copyShift = (p: number): number => -clamp01(p) * 12 // vh (v2 had opacity only)

/** Once the copy is visually gone it must also stop receiving pointer and keyboard focus. */
export const copyInteractive = (p: number): boolean => copyOpacity(p) > 0.02

/** Crossfade from frame-1 (under the video) to the brighter frame-2. */
export const frame2Opacity = (p: number): number => clamp01((p - 0.05) / 0.4)

/** Gold flood that carries the eye into the next section. */
export const bloomOpacity = (p: number): number => clamp01((p - 0.42) / 0.48)

/** Pointer parallax fades out as the dive progresses. */
export const parallaxFalloff = (p: number): number => 1 - clamp01(p)

/** The native video is paused once frame-2 fully covers it (frame2Opacity(0.5) === 1). */
export const VIDEO_PAUSE_AT = 0.5
export const videoCovered = (p: number): boolean => p > VIDEO_PAUSE_AT

/** Pointer position → parallax offset in px. `range` is the full-screen span. */
export const POINTER_RANGE = { x: 22, y: 14 } as const
export const pointerOffset = (client: number, viewport: number, range: number): number =>
  (client / viewport - 0.5) * range

/**
 * Spring smoothing applied to scroll progress (replaces v2's per-frame lerp of 0.09).
 * 70/28 settles to 95% in ≈1.12 s (twice as laggy as v2's ≈0.53 s); 150/30 settles in ≈0.52 s
 * with no overshoot, which matches the prototype's feel.
 */
export const HERO_SPRING = {
  stiffness: 150,
  damping: 30,
  mass: 1,
  restDelta: 0.0005,
  restSpeed: 0.01,
} as const

/** Pointer parallax smoothing (v2 lerp 0.06 ≈ 0.82 s to 95%; 50/16 ≈ 0.81 s). */
export const POINTER_SPRING = {
  stiffness: 50,
  damping: 16,
  mass: 1,
  restDelta: 0.01,
} as const
