export interface Keyframe {
  id: string;
  time: number; // Offset time within clip in seconds (0 <= time <= clip.duration)
  position?: { x: number; y: number };
  scale?: number;
  opacity?: number;
  fontSize?: number;
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

/**
 * Calculates easing modifier for progress value between 0 and 1.
 */
export function applyEasing(progress: number, easing?: string): number {
  const p = Math.max(0, Math.min(1, progress));
  if (easing === 'easeIn') return p * p;
  if (easing === 'easeOut') return p * (2 - p);
  if (easing === 'easeInOut') return p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
  return p; // Default: linear
}

/**
 * Computes interpolated clip properties at a given playhead timestamp.
 */
export function getInterpolatedClipProperties(clip: any, playhead: number) {
  const defaultProps = {
    scale: clip.scale ?? 1,
    opacity: clip.opacity ?? 1,
    position: { x: clip.position?.x ?? 50, y: clip.position?.y ?? 50 },
    fontSize: clip.fontSize ?? 48,
  };

  if (!clip.keyframes || clip.keyframes.length === 0) {
    return defaultProps;
  }

  // Calculate relative clip time
  const clipTime = Math.max(0, Math.min(clip.duration, playhead - clip.startTime));
  
  // Sort keyframes by timestamp
  const sorted: Keyframe[] = [...clip.keyframes].sort((a, b) => a.time - b.time);

  // Before or at first keyframe
  if (clipTime <= sorted[0].time) {
    const k0 = sorted[0];
    return {
      scale: k0.scale ?? defaultProps.scale,
      opacity: k0.opacity ?? defaultProps.opacity,
      position: k0.position ? { ...k0.position } : defaultProps.position,
      fontSize: k0.fontSize ?? defaultProps.fontSize,
    };
  }

  // After or at last keyframe
  if (clipTime >= sorted[sorted.length - 1].time) {
    const last = sorted[sorted.length - 1];
    return {
      scale: last.scale ?? defaultProps.scale,
      opacity: last.opacity ?? defaultProps.opacity,
      position: last.position ? { ...last.position } : defaultProps.position,
      fontSize: last.fontSize ?? defaultProps.fontSize,
    };
  }

  // Find bounding keyframes k1 and k2
  let k1 = sorted[0];
  let k2 = sorted[sorted.length - 1];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (clipTime >= sorted[i].time && clipTime <= sorted[i + 1].time) {
      k1 = sorted[i];
      k2 = sorted[i + 1];
      break;
    }
  }

  const duration = k2.time - k1.time;
  if (duration <= 0) {
    return {
      scale: k1.scale ?? defaultProps.scale,
      opacity: k1.opacity ?? defaultProps.opacity,
      position: k1.position ? { ...k1.position } : defaultProps.position,
      fontSize: k1.fontSize ?? defaultProps.fontSize,
    };
  }

  let p = (clipTime - k1.time) / duration;
  p = applyEasing(p, k2.easing);

  // Interpolate scale
  const k1Scale = k1.scale ?? defaultProps.scale;
  const k2Scale = k2.scale ?? defaultProps.scale;
  const scale = k1Scale + (k2Scale - k1Scale) * p;

  // Interpolate opacity
  const k1Opacity = k1.opacity ?? defaultProps.opacity;
  const k2Opacity = k2.opacity ?? defaultProps.opacity;
  const opacity = k1Opacity + (k2Opacity - k1Opacity) * p;

  // Interpolate position
  const k1PosX = k1.position?.x ?? defaultProps.position.x;
  const k2PosX = k2.position?.x ?? defaultProps.position.x;
  const k1PosY = k1.position?.y ?? defaultProps.position.y;
  const k2PosY = k2.position?.y ?? defaultProps.position.y;
  const posX = k1PosX + (k2PosX - k1PosX) * p;
  const posY = k1PosY + (k2PosY - k1PosY) * p;

  // Interpolate font size
  const k1Font = k1.fontSize ?? defaultProps.fontSize;
  const k2Font = k2.fontSize ?? defaultProps.fontSize;
  const fontSize = k1Font + (k2Font - k1Font) * p;

  return {
    scale,
    opacity,
    position: { x: posX, y: posY },
    fontSize,
  };
}
