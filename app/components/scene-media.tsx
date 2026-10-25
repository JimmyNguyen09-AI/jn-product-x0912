/* eslint-disable @next/next/no-img-element -- Local SVG/WebP assets are already optimized; protected uploads must retain direct origin authentication and revocation. */
import type { CSSProperties } from "react";
import { media } from "../content";
import StoryThread from "./story-thread";
export function Media({ name }: { name: keyof typeof media }) {
  const asset = media[name];
  return (
    <div
      className={`media media-${name}`}
      style={
        {
          "--media-position": asset.position,
          "--media-mobile-position": asset.mobilePosition,
        } as CSSProperties
      }
    >
      {name === "love" ? <picture>
        <source media="(max-width: 600px)" srcSet="/media/love-mobile.webp" width="680" height="720"/>
        <img className="static-poster" src={asset.poster} alt={asset.description} width="1280" height="720"/>
      </picture> : <img
        className="static-poster"
        src={asset.poster}
        alt={asset.description}
        width="1280"
        height="720"
        fetchPriority={name === "walk" ? "high" : "auto"}
      />}
      {(name === "trust" || name === "bloom" || name === "love") && (
        name === "love" ? <picture><source media="(max-width: 600px)" srcSet="/media/love-mobile-start.webp" width="680" height="720"/><img className="start-poster" src="/media/love-start.webp" alt="" width="1280" height="720"/></picture> : <img
          className="start-poster"
          src={`/media/${name}-start.webp`}
          alt=""
          width="1280"
          height="720"
        />
      )}
      <video
        data-name={name}
        muted
        playsInline
        preload="none"
        poster={
          name === "trust" || name === "bloom" || name === "love"
            ? `/media/${name}-start.webp`
            : asset.poster
        }
        aria-hidden="true"
        tabIndex={-1}
        disablePictureInPicture
      />
      {name !== "love" && <StoryThread scene={name} />}
      {name === "walk" && <div className="loop-fog" aria-hidden="true" />}
      <span className="media-status" role="status" />
    </div>
  );
}
export function Beats({ lines }: { lines: string[] }) {
  return (
    <>
      <p className="sr-only">{lines.join(" ")}</p>
      <div className="beats" aria-hidden="true">
        {lines.map((line, i) => (
          <p className="beat" data-beat={i} key={line}>
            {line}
          </p>
        ))}
      </div>
    </>
  );
}
