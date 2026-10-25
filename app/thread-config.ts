// Seconds measured against the supplied web clips; scrub targets never drive a
// critical event before its decoded frame has arrived.
export const threadTiming = {
  tensionStart: 1.8, tensionEnd: 3.8, breakPoint: 4.45, breakSettle: 0.45,
  untangleStart: 2.7, untangleEnd: 6.4, goldStart: 3.25, goldEnd: 6.7,
  fogLead: 0.85, fogHold: 0.12, fogClear: 0.7,
};
export type ThreadScene = "walk" | "trust" | "noise" | "bloom";
export const threadPaths = {
  walk: {
    desktop: "M180 555 C225 548 280 580 331 563 S415 528 446 551 C466 570 451 592 484 615 S538 646 550 695",
    mobile: "M220 480 C202 510 225 551 272 564 S347 581 320 620 C300 645 280 661 300 700",
  },
  noise: {
    desktop: "M235 52 C213 110 249 166 231 226 C214 279 160 274 155 241 C149 203 217 205 220 252 C223 306 166 332 174 389 C183 441 229 481 214 545 S188 628 230 695",
    mobile: "M190 62 C173 126 194 195 169 246 C155 274 118 263 125 237 C138 205 178 247 165 281 C143 342 184 383 168 442 S149 547 188 650",
  },
  bloom: {
    desktop: "M270 55 C249 116 302 177 278 233 C259 282 210 261 230 232 C251 202 301 254 270 300 C242 345 320 364 293 414 C277 445 239 420 256 400 C280 370 318 438 301 478 C282 592 341 645 461 660 L507 665",
    mobile: "M224 65 C199 130 240 188 213 239 C193 275 165 248 185 227 C209 205 239 261 209 303 C179 346 222 392 205 447 C188 583 249 648 348 661 L412 668",
  },
};
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b-a)*t;
export function threadState(scene: ThreadScene, progress: number, seconds: number) {
  const tension = clamp((seconds-threadTiming.tensionStart)/(threadTiming.tensionEnd-threadTiming.tensionStart));
  const broken = seconds >= threadTiming.breakPoint;
  const settle = broken ? clamp((seconds-threadTiming.breakPoint)/threadTiming.breakSettle) : 0;
  const opening = clamp((seconds-threadTiming.untangleStart)/(threadTiming.untangleEnd-threadTiming.untangleStart));
  return { reveal: scene === "walk" ? .25+.75*progress : .4+.6*progress, tension, broken, settle, opening,
    gold: clamp((seconds-threadTiming.goldStart)/(threadTiming.goldEnd-threadTiming.goldStart)),
    // All coordinates share the native video aspect ratio; no subject tracking.
    joined: `M430 558 C505 ${lerp(615,570,tension)} 572 ${lerp(608,572,tension)} 640 571 C706 ${lerp(605,571,tension)} 772 ${lerp(600,567,tension)} 850 550`,
    left: `M430 558 C499 ${lerp(570,598,settle)} 562 ${lerp(573,603,settle)} ${lerp(640,616,settle)} ${lerp(571,612,settle)}`,
    right: `M${lerp(640,665,settle)} ${lerp(571,607,settle)} C720 ${lerp(571,601,settle)} 782 ${lerp(567,590,settle)} 850 550`,
  };
}
export function applyThread(svg: SVGSVGElement, scene: ThreadScene, progress: number, seconds: number) {
  const state=threadState(scene,progress,seconds);
  svg.style.setProperty("--thread-reveal", String(state.reveal));
  svg.style.setProperty("--thread-open", String(state.opening));
  svg.style.setProperty("--thread-gold", scene === "bloom" ? String(state.gold) : "0");
  svg.dataset.broken=String(scene === "trust" && state.broken);
  if(scene === "trust") {
    for(const part of ["joined","left","right"] as const)
      svg.querySelectorAll(`[data-part="${part}"]`).forEach(path=>path.setAttribute("d",state[part]));
  }
}
export function fogOpacity(seconds: number, duration: number) {
  if(!Number.isFinite(duration)||duration<=0)return 0;
  const start=1-clamp((seconds-threadTiming.fogHold)/(threadTiming.fogClear-threadTiming.fogHold));
  const end=clamp((seconds-(duration-threadTiming.fogLead))/threadTiming.fogLead);
  return .97*Math.max(start,end);
}
