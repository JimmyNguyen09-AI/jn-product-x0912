/* eslint-disable react-hooks/immutability -- This effect controls DOM media nodes through a ref; React props and state are never mutated. */
"use client";
import { useEffect, type RefObject } from "react";
import { chapters, media, motion, type SceneName } from "./content";
import { fogOpacity } from "./video-fog";
const clamp = (n: number) => Math.min(1, Math.max(0, n));
export function useStoryMotion(root: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const page = root.current!;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let dispose = () => {};
    const positionKey = `jn-reading-position:${location.pathname}`;
    const reload =
      (
        performance.getEntriesByType(
          "navigation",
        )[0] as PerformanceNavigationTiming
      )?.type === "reload";
    let restored = false;
    let readingRestored = false;
    let initialHashDone = false;
    const initialHash = location.hash;
    const remember = () => {
      try {
        const list = Array.from(
          page.querySelectorAll<HTMLElement>("main>section"),
        );
        const section =
          list.filter((s) => s.getBoundingClientRect().top <= 1).at(-1) ||
          list[0];
        const sticky = section.querySelector<HTMLElement>(".scene-inner");
        sessionStorage.setItem(
          positionKey,
          JSON.stringify({
            id: section.id,
            progress:
              (scrollY - section.offsetTop) /
              Math.max(1, section.offsetHeight - (sticky?.offsetHeight || 0)),
          }),
        );
      } catch {
        /* Storage may be disabled. Native restoration still works. */
      }
    };
    window.addEventListener("pagehide", remember);
    function setup() {
      dispose();
      let alive = true;
      let raf = 0;
      const reduced = preference.matches;
      const sections = Array.from(
        page.querySelectorAll<HTMLElement>("[data-scene]"),
      );
      const videos = Array.from(
        page.querySelectorAll<HTMLVideoElement>("video"),
      );
      const hero = page.querySelector<HTMLElement>("#beginning")!;
      const trust = page.querySelector<HTMLElement>("#trust")!;
      const cloud = page.querySelector<HTMLElement>(".cloud-transition")!;
      const targets = new Map<HTMLVideoElement, number>();
      const visible = new Set<HTMLVideoElement>();
      const compactVideo = matchMedia("(max-width: 600px)");
      const removers: (() => void)[] = [];
      const listen = (el: EventTarget, event: string, fn: EventListener) => {
        el.addEventListener(event, fn, { passive: true });
        removers.push(() => el.removeEventListener(event, fn));
      };
      const status = (v: HTMLVideoElement, text: string) => {
        v.parentElement!.querySelector(".media-status")!.textContent = text;
      };
      function seek(v: HTMLVideoElement) {
        const target = targets.get(v);
        if (
          target === undefined ||
          v.readyState < 2 ||
          v.seeking ||
          !Number.isFinite(v.duration)
        )
          return;
        v.pause();
        const t = Math.min(
          Math.max(0, v.duration - 1 / 24),
          target * v.duration,
        );
        if (Math.abs(v.currentTime - t) > 1 / 48) v.currentTime = t;
      }
      function cloudEnabled() {
        return (
          !reduced &&
          !hero.classList.contains("media-failed") &&
          !trust.classList.contains("media-failed") &&
          page.dataset.cloudReady === "true"
        );
      }
      function update() {
        raf = 0;
        if (!alive || !page.isConnected) return;
        const clouds = cloudEnabled();
        page.classList.toggle("clouds-enabled", clouds);
        if (clouds) {
          const switchAt = trust.offsetTop;
          const heroRange =
            hero.offsetHeight -
            hero.querySelector<HTMLElement>(".scene-inner")!.offsetHeight;
          const start = hero.offsetTop + heroRange * motion.cloud.heroStart;
          const end =
            switchAt +
            (trust.offsetHeight -
              trust.querySelector<HTMLElement>(".scene-inner")!.offsetHeight) *
              motion.cloud.trustEnd;
          const incoming = clamp(
            (scrollY - start) / Math.max(1, switchAt - start),
          );
          const outgoing = clamp(
            (scrollY - switchAt) / Math.max(1, end - switchAt),
          );
          cloud.style.setProperty("--cloud-in", String(incoming));
          cloud.style.setProperty("--cloud-out", String(outgoing));
          cloud.style.opacity = String(
            clamp(incoming * 4) * clamp((1 - outgoing) * 4),
          );
          cloud.style.visibility =
            scrollY > start && scrollY < end ? "visible" : "hidden";
          trust.style.setProperty(
            "--trust-visible",
            scrollY >= switchAt ? "1" : "0",
          );
          page.dataset.cloudPhase =
            incoming < 1 ? "enter" : outgoing < 1 ? "leave" : "done";
        } else {
          cloud.style.visibility = "hidden";
          trust.style.removeProperty("--trust-visible");
        }
        sections.forEach((section) => {
          if (!section.classList.contains("enhanced")) return;
          const sticky = section.querySelector<HTMLElement>(".scene-inner")!;
          const p = clamp(
            -section.getBoundingClientRect().top /
              Math.max(1, section.offsetHeight - sticky.offsetHeight),
          );
          section.style.setProperty("--scene-progress", String(p));
          const name = section.dataset.scene as SceneName;
          if (name === "walk")
            section.style.setProperty(
              "--hero-chrome-opacity",
              String(1 - clamp((p - 0.8) / 0.06)),
            );
          const phase =
            name === "trust" && clouds
              ? clamp((p - motion.cloud.trustEnd) / (1 - motion.cloud.trustEnd))
              : name === "love" ? clamp(p / motion.love.holdStart) : p;
          if(name === "love") section.style.setProperty("--love-out", String(clamp((p-motion.love.fadeStart)/(1-motion.love.fadeStart))));
          section.style.setProperty("--video-progress", String(phase));
          section.querySelectorAll<HTMLElement>(".beat").forEach((beat, i) => {
            const [start, end] = motion.beats[name][i];
            let opacity = Math.min(
              start === 0 ? 1 : clamp((phase - start) / motion.fade),
              end === 1 ? 1 : clamp((end - phase) / motion.fade),
            );
            if (name === "trust" && clouds && p < motion.cloud.trustEnd)
              opacity = 0;
            beat.style.opacity = String(opacity);
            beat.style.transform = `translateY(${(1 - opacity) * 5}px)`;
          });
          if (name !== "walk") {
            const video = section.querySelector("video")!;
            targets.set(
              video,
              name === "bloom" ? clamp(p / motion.flowerHoldStart) : phase,
            );
            seek(video);
          }
        });
        page.style.setProperty(
          "--reading",
          `${clamp(scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)) * 100}%`,
        );
        let active = "beginning";
        chapters.forEach(([id]) => {
          if (
            document.getElementById(id)!.getBoundingClientRect().top <
            innerHeight * 0.5
          )
            active = id;
        });
        page
          .querySelectorAll<HTMLAnchorElement>(".chapter-links a")
          .forEach((a) => {
            if (a.hash === `#${active}`)
              a.setAttribute("aria-current", "location");
            else a.removeAttribute("aria-current");
          });
      }
      function schedule() {
        if (!raf && alive) raf = requestAnimationFrame(update);
      }
      function restoreReading() {
        if (!reload || restored) return;
        restored = true;
        document.fonts.ready.then(() => {
          if (!alive) return;
          try {
            const value = JSON.parse(
              sessionStorage.getItem(positionKey) || "null",
            );
            if (!value) return;
            const section = document.getElementById(value.id);
            if (!section || !Number.isFinite(value.progress)) return;
            update();
            const sticky = section.querySelector<HTMLElement>(".scene-inner");
            scrollTo(
              0,
              section.offsetTop +
                value.progress *
                  Math.max(
                    1,
                    section.offsetHeight - (sticky?.offsetHeight || 0),
                  ),
            );
            readingRestored = true;
            schedule();
          } catch {
            /* Invalid or unavailable storage uses native restoration. */
          }
        });
      }
      function syncInitialHash() {
        if(initialHashDone || !initialHash) return;
        initialHashDone = true;
        document.fonts.ready.then(() => {
          if(!alive || readingRestored || location.hash !== initialHash) return;
          let id: string;
          try { id = decodeURIComponent(initialHash.slice(1)); } catch { return; }
          const target = document.getElementById(id);
          if(!target || !page.contains(target)) return;
          update();
          if(id === "trust" && cloudEnabled()) {
            scrollTo(0,target.offsetTop + (target.offsetHeight-target.querySelector<HTMLElement>(".scene-inner")!.offsetHeight)*motion.cloud.trustEnd);
          } else target.scrollIntoView({block:"start",behavior:"instant"});
          schedule();
        });
      }
      function playback() {
        videos
          .filter(
            (v) => v.dataset.name === "walk" || v.dataset.name === "noise",
          )
          .forEach((v) => {
            if (
              !reduced &&
              visible.has(v) &&
              !document.hidden
            )
              v.play().catch(() => {});
            else v.pause();
          });
      }
      const prepare = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const v = entry.target as HTMLVideoElement;
            if (!v.getAttribute("src")) {
              status(v, "Đang tải khung hình…");
              v.src = v.dataset.name === "love" && compactVideo.matches ? media.love.mobileSrc : media[v.dataset.name as keyof typeof media].src;
              if(v.dataset.name === "love") v.poster = compactVideo.matches ? "/media/love-mobile-start.webp" : "/media/love-start.webp";
              v.load();
            }
            prepare.unobserve(v);
          }),
        { rootMargin: "800px 0px" },
      );
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) visible.add(e.target as HTMLVideoElement);
            else visible.delete(e.target as HTMLVideoElement);
          });
          playback();
        },
        { threshold: 0.08 },
      );
      videos.forEach((v) => {
        v.pause();
        if (reduced) {
          v.classList.remove("ready");
          status(v, "");
          return;
        }
        v.muted = true;
        v.loop = v.dataset.name === "walk" || v.dataset.name === "noise";
        if(v.dataset.name === "walk") {
          const fog=v.parentElement!.querySelector<HTMLElement>(".loop-fog")!;
          let frame=0;
          const paint=()=>{fog.style.opacity=String(fogOpacity(v.currentTime,v.duration));};
          const tick=()=>{frame=0;if(!alive||v.paused||!visible.has(v)||document.hidden)return;paint();frame=v.requestVideoFrameCallback(tick);};
          const start=()=>{if("requestVideoFrameCallback" in v && !frame)frame=v.requestVideoFrameCallback(tick);};
          const stop=()=>{if(frame)v.cancelVideoFrameCallback(frame);frame=0;};
          listen(v,"play",start);listen(v,"pause",stop);listen(v,"seeked",paint);
          listen(v,"timeupdate",paint);
          removers.push(()=>{stop();fog.style.opacity="0";});
          if(!v.paused)start();
        }
        listen(v, "loadedmetadata", schedule);
        listen(v, "loadeddata", () => {
          v.classList.add("ready");
          status(v, "");
          schedule();
          playback();
        });
        listen(v, "seeked", schedule);
        if (!v.loop) listen(v, "play", () => v.pause());
        listen(v, "error", () => {
          v.classList.remove("ready");
          status(v, "Không tải được video — đang hiển thị ảnh tĩnh.");
          const s = v.closest<HTMLElement>("[data-scene]");
          if (s) {
            s.classList.remove("enhanced");
            s.classList.add("media-failed");
          }
          schedule();
        });
        prepare.observe(v);
        observer.observe(v);
        if (v.readyState >= 2) v.classList.add("ready");
      });
      sections.forEach((s) => {
        if (!reduced && !s.classList.contains("media-failed"))
          s.classList.add("enhanced");
      });
      // Enable the overlap only after the texture is decoded; missing texture falls back to normal sections.
      let texture: HTMLImageElement | null = null;
      if (!reduced) {
        texture = new Image();
        texture.onload = () => {
          if (alive) {
            page.dataset.cloudReady = "true";
            update();
            restoreReading();
            syncInitialHash();
            schedule();
          }
        };
        texture.onerror = () => {
          if (alive) {
            page.dataset.cloudReady = "false";
            restoreReading();
            syncInitialHash();
            schedule();
          }
        };
        texture.src = motion.cloud.texture;
      } else { restoreReading(); syncInitialHash(); }
      const reveal = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("revealed");
              reveal.unobserve(e.target);
            }
          }),
        { threshold: 0.12 },
      );
      const reveals = Array.from(
        page.querySelectorAll<HTMLElement>(".closing,[data-reveal]"),
      );
      if (!reduced)
        reveals.forEach((e) => {
          e.classList.add("reveal-ready");
          reveal.observe(e);
        });
      listen(window, "scroll", schedule);
      listen(window, "resize", schedule);
      listen(window, "pageshow", schedule);
      listen(window, "hashchange", schedule);
      listen(document, "visibilitychange", playback);
      const sizes = new ResizeObserver(schedule);
      listen(compactVideo,"change",() => {
        const love = videos.find(v => v.dataset.name === "love");
        if(!love?.getAttribute("src")) return;
        love.classList.remove("ready");
        love.src = compactVideo.matches ? media.love.mobileSrc : media.love.src;
        love.poster = compactVideo.matches ? "/media/love-mobile-start.webp" : "/media/love-start.webp";
        love.load();
        schedule();
      });
      sizes.observe(page);
      document.fonts.ready.then(schedule);
      update();
      dispose = () => {
        alive = false;
        cancelAnimationFrame(raf);
        removers.forEach((fn) => fn());
        prepare.disconnect();
        observer.disconnect();
        reveal.disconnect();
        sizes.disconnect();
        if (texture) {
          texture.onload = null;
          texture.onerror = null;
        }
        videos.forEach((v) => v.pause());
        sections.forEach((s) => s.classList.remove("enhanced"));
        reveals.forEach((e) => e.classList.remove("reveal-ready"));
        page.classList.remove("clouds-enabled");
        cloud.style.visibility = "hidden";
        trust.style.removeProperty("--trust-visible");
      };
    }
    setup();
    preference.addEventListener("change", setup);
    return () => {
      dispose();
      preference.removeEventListener("change", setup);
      window.removeEventListener("pagehide", remember);
    };
  }, [root]);
}
