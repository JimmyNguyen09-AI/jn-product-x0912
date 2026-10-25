export const fogTiming = { lead: 0.85, hold: 0.12, clear: 0.7 };
const clamp = (value: number) => Math.max(0, Math.min(1, value));

export function fogOpacity(seconds: number, duration: number) {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  const start = 1 - clamp((seconds - fogTiming.hold) / (fogTiming.clear - fogTiming.hold));
  const end = clamp((seconds - (duration - fogTiming.lead)) / fogTiming.lead);
  return .97 * Math.max(start, end);
}
