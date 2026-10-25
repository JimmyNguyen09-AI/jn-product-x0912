/* eslint-disable @next/next/no-img-element -- Local SVG/WebP assets are already optimized; protected uploads must retain direct origin authentication and revocation. */
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Children, isValidElement, type ReactNode } from "react";
export function headingId(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");
}
function plain(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) =>
      typeof child === "string" || typeof child === "number"
        ? String(child)
        : isValidElement<{ children?: ReactNode }>(child)
          ? plain(child.props.children)
          : "",
    )
    .join("");
}
export default function StoryMarkdown({ body }: { body: string }) {
  return (
    <div className="story-prose">
      <Markdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          h1: ({ children }) => (
            <h2 id={headingId(plain(children))}>{children}</h2>
          ),
          h2: ({ children }) => (
            <h2 id={headingId(plain(children))}>{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 id={headingId(plain(children))}>{children}</h3>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              {...(href?.startsWith("https://") || href?.startsWith("http://")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) =>
            typeof src === "string" &&
            /^\/media\/(uploads\/[a-f0-9-]{36}\.webp|[a-z-]+\.webp)$/.test(
              src,
            ) ? (
              <img src={src} alt={alt || ""} loading="lazy" />
            ) : (
              <span className="image-unavailable">[Không tải được hình ảnh]</span>
            ),
        }}
      >
        {body}
      </Markdown>
    </div>
  );
}
