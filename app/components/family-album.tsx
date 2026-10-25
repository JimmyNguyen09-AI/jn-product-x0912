"use client";
/* eslint-disable @next/next/no-img-element -- Supplied images have explicit responsive WebP derivatives; originals load only in the viewer. */
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import { useMotionTokens } from "@animate-ui/react/utils/motion";
import { memories, memoryThumbnail } from "../family-content";
import { InkButton } from "./motion-system";

const initialOrder = [0, 1, 2, 3];
function photoPose(depth: number, compact: boolean) {
  const spread = compact ? .58 : 1;
  return [
    { x: 0, y: 27, rotate: -1.5 },
    { x: -66 * spread, y: -15, rotate: -5 },
    { x: 6 * spread, y: compact ? -48 : -66, rotate: 2.5 },
    { x: 66 * spread, y: -17, rotate: 5 },
  ][depth];
}

export default function FamilyAlbum() {
  const a = useAnimationControls(), b = useAnimationControls();
  const c = useAnimationControls(), d = useAnimationControls();
  const controls = [a, b, c, d];
  const controlsRef = useRef(controls);
  const { transition } = useMotionTokens();
  const reduce = useReducedMotion();
  const [order, setOrder] = useState(initialOrder);
  const [busy, setBusy] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [error, setError] = useState("");
  const [viewer, setViewer] = useState<number | null>(null);
  const orderRef = useRef(initialOrder);
  const moving = useRef(false), pending = useRef<number | null>(null);
  const mounted = useRef(true), compact = useRef(false);
  const stage = useRef<HTMLDivElement>(null);
  const photos = useRef<(HTMLButtonElement | null)[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const chooseRef = useRef<(id: number) => void>(() => {});
  const front = order[0];

  useEffect(() => {
    mounted.current = true;
    const animationControls = controlsRef.current;
    const observer = new ResizeObserver(([entry]) => {
      compact.current = entry.contentRect.width < 650;
      if (!moving.current) orderRef.current.forEach((id, depth) => {
        controlsRef.current[id].set(photoPose(depth, compact.current));
      });
    });
    observer.observe(stage.current!);
    return () => {
      mounted.current = false;
      observer.disconnect();
      animationControls.forEach(control => control.stop());
    };
  }, []);

  const choose = useCallback(async (id: number) => {
    if (moving.current) { pending.current = id; return; }
    if (orderRef.current[0] === id) return;
    moving.current = true;
    setBusy(true);
    setError("");
    const button = photos.current[id]!;
    try {
      // Keep the current photo until the requested image has decoded.
      await button.querySelector("img")!.decode();
      if (!mounted.current) return;
      const previous = orderRef.current;
      const depth = previous.indexOf(id);
      const pose = photoPose(depth, compact.current);
      const next = [id, ...previous.filter(item => item !== id)];
      if (!reduce) {
        // Exit in the direction of the exposed edge, at the original z-index.
        await controlsRef.current[id].start({
          x: compact.current ? pose.x * .5 : (pose.x < 0 ? -1 : 1) * (button.offsetWidth + 28),
          y: compact.current ? -button.offsetHeight - 24 : -65,
          rotate: pose.rotate,
          transition: { ...transition.disclosure, duration: .25 },
        });
      }
      if (!mounted.current) return;
      // Only now bring the selected photo in front of the other three.
      orderRef.current = next;
      setOrder(next);
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      if (!mounted.current) return;
      if (reduce) next.forEach((item, index) => controlsRef.current[item].set(photoPose(index, compact.current)));
      else await Promise.all(next.map((item, index) => controlsRef.current[item].start({
        ...photoPose(index, compact.current),
        transition: { ...transition.disclosure, duration: .32 },
      })));
      if (!mounted.current) return;
      next.forEach((item, index) => controlsRef.current[item].set(photoPose(index, compact.current)));
      if (pending.current === null || pending.current === id)
        setAnnouncement(`${memories[id].label}. ${memories[id].caption}`);
    } catch {
      if (mounted.current) setError("Chưa tải được ảnh này. Bạn thử chọn lại nhé.");
    } finally {
      moving.current = false;
      if (mounted.current) {
        setBusy(false);
        const queued = pending.current;
        pending.current = null;
        if (queued !== null && queued !== orderRef.current[0]) chooseRef.current(queued);
      }
    }
  }, [reduce, transition.disclosure]);
  useEffect(() => { chooseRef.current = choose; }, [choose]);

  function openViewer(index: number, source: HTMLElement) {
    if (moving.current) return;
    opener.current = source;
    setViewer(index);
  }
  const closeViewer = useCallback(() => setViewer(null), []);
  const viewerOpen = viewer !== null;
  /* eslint-disable react-hooks/immutability -- This effect locks native document scrolling and restores the exact previous styles on close. It never mutates React data. */
  useEffect(() => {
    if (!viewerOpen) return;
    const element = dialog.current!;
    const y = window.scrollY;
    const previousOverflow = document.documentElement.style.overflow;
    const previousBody = { position: document.body.style.position, top: document.body.style.top, width: document.body.style.width };
    document.documentElement.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${y}px`;
    document.body.style.width = "100%";
    element.showModal();
    closeButton.current?.focus();
    return () => {
      if (element.open) element.close();
      document.documentElement.style.overflow = previousOverflow;
      Object.assign(document.body.style, previousBody);
      window.scrollTo(0, y);
      opener.current?.focus({ preventScroll: true });
    };
  }, [viewerOpen]);
  /* eslint-enable react-hooks/immutability */

  return <div className="family-album">
    <div className="album-interactive">
      <p className="album-instruction">Pick a memory. <span>Bấm ảnh phía trước để xem lớn.</span></p>
      <div ref={stage} className="album-stage" aria-label="Chồng bốn ảnh gia đình" aria-busy={busy}>
        {memories.map((memory, index) => {
          const depth = order.indexOf(index), active = depth === 0;
          return <motion.button
            key={memory.id}
            ref={element => { photos.current[index] = element; }}
            type="button"
            className={`album-photo ${active ? "is-front" : "is-behind"}`}
            data-memory={memory.id}
            data-depth={depth}
            style={{ zIndex: 4 - depth }}
            initial={photoPose(initialOrder.indexOf(index), false)}
            animate={controls[index]}
            tabIndex={active ? 0 : -1}
            aria-label={active ? `Xem ảnh ${memory.label} kích thước lớn` : `Đưa ảnh ${memory.label} lên trước`}
            onClick={event => active ? openViewer(index, event.currentTarget) : choose(index)}
          >
            <span className="memory-label">{memory.label}</span>
            <img src={memoryThumbnail(index)} srcSet={`${memoryThumbnail(index,640)} 640w, ${memoryThumbnail(index)} 960w`} sizes="(max-width: 600px) 70vw, (max-width: 950px) 60vw, 560px" width="960" height="720" loading="lazy" decoding="async" alt={memory.alt} />
            <span className="photo-edge-note" aria-hidden="true">{String(index+1).padStart(2,"0")} / {active ? "mở một kỷ niệm ↗" : memory.label}</span>
          </motion.button>;
        })}
      </div>
      <div className="memory-picker" role="group" aria-label="Chọn ảnh trong album">
        {memories.map((memory,index) => <InkButton key={memory.id} className="memory-choice" aria-pressed={front === index} aria-label={`Chọn ảnh ${memory.label}`} onClick={() => choose(index)}><span aria-hidden="true">0{index+1}</span>{memory.label}</InkButton>)}
      </div>
      <div className="memory-caption" data-active-memory={memories[front].id}>
        <p className="chapter-label">{memories[front].label}</p>
        <p>{memories[front].caption}</p>
      </div>
      <p className="sr-only" role="status" aria-atomic="true">{announcement}</p>
      <p className="album-error" role="alert">{error}</p>
    </div>
    <noscript><style>{`.album-interactive{display:none!important}`}</style><div className="album-nojs">{memories.map((memory,index) => <figure key={memory.id}><img src={memoryThumbnail(index)} alt={memory.alt} width="960" height="720" loading="lazy"/><figcaption><strong>{memory.label}</strong><p>{memory.caption}</p><a href={memory.original}>Xem ảnh đầy đủ ↗</a></figcaption></figure>)}</div></noscript>
    <dialog ref={dialog} className="memory-viewer" aria-label="Xem kỷ niệm gia đình" aria-describedby="viewer-caption" onCancel={event => { event.preventDefault(); closeViewer(); }} onClick={event => { if(event.target === event.currentTarget)closeViewer(); }} onKeyDown={event => {
      if(event.key === "Tab") {
        const buttons=Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not([disabled])"));
        const first=buttons[0], last=buttons[buttons.length-1];
        if(event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if(!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
      if(event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        setViewer(index => index === null ? null : (index + (event.key === "ArrowLeft" ? 3 : 1)) % memories.length);
      }
    }}>
      {viewer !== null && <div className="viewer-sheet">
        <div className="viewer-topline"><span>{String(viewer+1).padStart(2,"0")} / 04 · {memories[viewer].label}</span><InkButton ref={closeButton} className="viewer-close" onClick={closeViewer} aria-label="Đóng ảnh">Đóng <span aria-hidden="true">×</span></InkButton></div>
        <figure><div className="viewer-image-wrap"><img className="viewer-preview" src={memoryThumbnail(viewer)} alt="" aria-hidden="true" width="960" height="720"/><img className="viewer-original" key={viewer} src={memories[viewer].original} alt={memories[viewer].alt} width="1448" height="1086" onLoad={event=>{event.currentTarget.dataset.ready="true";}}/></div><figcaption id="viewer-caption">{memories[viewer].caption}</figcaption></figure>
        <div className="viewer-actions"><InkButton className="text-button" aria-label="Ảnh trước" onClick={() => setViewer((viewer+3)%4)}>← Ảnh trước</InkButton><span aria-hidden="true">Một khoảng thời gian được giữ lại.</span><InkButton className="text-button" aria-label="Ảnh tiếp theo" onClick={() => setViewer((viewer+1)%4)}>Ảnh sau →</InkButton></div>
      </div>}
    </dialog>
  </div>;
}
