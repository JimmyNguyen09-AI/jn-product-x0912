/* eslint-disable @next/next/no-img-element -- Local SVG/WebP assets are already optimized; protected uploads must retain direct origin authentication and revocation. */
"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useMotionTokens } from "@animate-ui/react/utils/motion";
import { InkButton } from "../components/motion-system";
import StoryMarkdown from "../components/story-markdown";
import { topics, topicNames, statusNames, type StoryEntry } from "@/lib/types";
type Draft = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  topic: StoryEntry["topic"];
  status: StoryEntry["status"];
  cover: string;
  coverAlt: string;
  version?: number;
};
const blank = (): Draft => ({
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  topic: "alone",
  status: "draft",
  cover: "",
  coverAlt: "",
});
const toDraft = (s: StoryEntry): Draft => ({
  id: s.id,
  title: s.title,
  slug: s.slug,
  excerpt: s.excerpt,
  body: s.body,
  topic: s.topic,
  status: s.status,
  cover: s.cover,
  coverAlt: s.coverAlt,
  version: s.version,
});
const slugify = (text: string) =>
  text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
export default function WritingDesk({
  initialStories,
  email,
}: {
  initialStories: StoryEntry[];
  email: string;
}) {
  const [stories, setStories] = useState(initialStories),
    [draft, setDraft] = useState<Draft>(blank),
    [dirty, setDirty] = useState(false),
    [busy, setBusy] = useState(false),
    [uploading, setUploading] = useState(false),
    [preview, setPreview] = useState(false),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [filter, setFilter] = useState("all");
  const titleRef = useRef<HTMLInputElement>(null),
    editorRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const { transition } = useMotionTokens();
  useEffect(() => {
    const guard = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);
  function change<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setDirty(true);
    setNotice("");
    setError("");
  }
  function choose(story?: StoryEntry) {
    if (busy || uploading) return;
    if (dirty && !window.confirm("Bỏ những thay đổi chưa lưu trên trang này?"))
      return;
    setDraft(story ? toDraft(story) : blank());
    setDirty(false);
    setPreview(false);
    setNotice("");
    setError("");
    requestAnimationFrame(() => titleRef.current?.focus());
  }
  async function save(status: Draft["status"]) {
    if (busy || uploading) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { id, ...data } = draft;
      const result = await fetch(
        id ? `/api/admin/stories/${id}` : "/api/admin/stories",
        {
          method: id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, status }),
        },
      );
      const payload = await result.json();
      if (!result.ok) throw new Error(payload.error);
      const story = payload.story as StoryEntry;
      setDraft(toDraft(story));
      setStories((all) => [story, ...all.filter((s) => s.id !== story.id)]);
      setDirty(false);
      setNotice(
        status === "published"
          ? "Đã xuất bản. Trang viết đã có trong góc đọc chuyện."
          : status === "archived"
            ? "Đã cất vào kho. Trang viết không còn hiển thị công khai."
            : "Đã lưu bản nháp. Chỉ bạn có thể đọc.",
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không lưu được trang viết này.");
    } finally {
      setBusy(false);
    }
  }
  async function upload(file: File | undefined, inline = false) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
      const result = await fetch("/api/admin/uploads", {
        method: "POST",
        body: form,
      });
      const data = await result.json();
      if (!result.ok) throw new Error(data.error);
      if (inline) {
        const position = editorRef.current?.selectionStart ?? draft.body.length;
        const text = `\n\n![Mô tả hình ảnh này](${data.url})\n\n`;
        change(
          "body",
          draft.body.slice(0, position) + text + draft.body.slice(position),
        );
      } else {
        change("cover", data.url);
        setNotice("Đã tải ảnh bìa. Hãy thêm mô tả ảnh trước khi lưu.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tải lên không thành công.");
    } finally {
      setUploading(false);
    }
  }
  async function importMarkdown(file: File | undefined) {
    if (!file) return;
    if (!/\.(md|txt)$/i.test(file.name) || file.size > 80000) {
      setError("Chọn tệp Markdown hoặc văn bản dưới 80 KB.");
      return;
    }
    if (
      draft.body &&
      !window.confirm("Thay nội dung đang viết bằng tệp này?")
    )
      return;
    try {
      change("body", await file.text());
      setNotice("Đã nhập văn bản. Hãy xem lại trước khi lưu hoặc xuất bản.");
    } catch {
      setError("Không đọc được tệp này.");
    }
  }
  async function logout() {
    if (dirty && !window.confirm("Đăng xuất và bỏ những thay đổi chưa lưu?"))
      return;
    try {
      const result = await fetch("/api/admin/logout", { method: "POST" });
      if (!result.ok) throw new Error();
      router.replace("/admin/login");
      router.refresh();
    } catch {
      setError("Không đăng xuất được. Vui lòng thử lại.");
    }
  }
  return (
    <>
      <header className="desk-heading">
        <div>
          <p className="chapter-label">Bàn viết riêng của bạn</p>
          <h1>Chỗ cho trang viết tiếp theo.</h1>
          <p>Giữ lại cho mình. Chia sẻ khi bạn sẵn sàng.</p>
        </div>
        <div className="desk-account">
          <span>{email}</span>
          <InkButton className="text-button" onClick={logout}>
            Đăng xuất ↗
          </InkButton>
        </div>
      </header>
      <div className="desk-layout">
        <aside className="desk-index">
          <InkButton className="ink-button" onClick={() => choose()}>
            + Viết một trang mới
          </InkButton>
          <label htmlFor="desk-filter">Trang viết của bạn</label>
          <select
            id="desk-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tất cả trang viết ({stories.length})</option>
            <option value="draft">Bản nháp</option>
            <option value="published">Đã xuất bản</option>
            <option value="archived">Đã cất vào kho</option>
          </select>
          <div className="desk-story-list">
            {stories
              .filter((s) => filter === "all" || s.status === filter)
              .map((s) => (
                <button
                  key={s.id}
                  className={draft.id === s.id ? "selected" : ""}
                  onClick={() => choose(s)}
                  aria-pressed={draft.id === s.id}
                >
                  <span className={`status-dot status-${s.status}`}>
                    {statusNames[s.status]}
                  </span>
                  <strong>{s.title}</strong>
                  <small>{topicNames[s.topic]}</small>
                </button>
              ))}
            {!stories.some((s) => filter === "all" || s.status === filter) && (
              <p className="form-hint">Chưa có trang viết trong nhóm này.</p>
            )}
          </div>
          <p className="desk-help">
            Bạn có thể sửa bốn trang mở đầu. Nội dung chỉ mở rộng các chủ đề đã có; hãy đọc lại và chỉnh thành lời của mình trước khi chia sẻ.
          </p>
        </aside>
        <section className="editor-sheet" aria-label="Trình soạn câu chuyện">
          <div className="editor-topline">
            <span>
              {draft.id ? "Đang sửa trang viết" : "Một trang mới"} ·{" "}
              {dirty
                ? "Có thay đổi chưa lưu"
                : draft.id
                  ? statusNames[draft.status]
                  : "Chưa lưu"}
            </span>
            <InkButton
              className="reader-tool"
              aria-pressed={preview}
              onClick={() => setPreview(!preview)}
            >
              {preview ? "← Sửa nội dung" : "Xem trước ↗"}
            </InkButton>
          </div>
          <fieldset disabled={busy || uploading} className="editor-fields">
            <label htmlFor="story-title-input">Tiêu đề</label>
            <input
              ref={titleRef}
              id="story-title-input"
              value={draft.title}
              maxLength={160}
              placeholder="Đặt tên cho trang viết này"
              onChange={(e) => {
                const title = e.target.value;
                setDraft((d) => ({
                  ...d,
                  title,
                  slug:
                    !d.id && (d.slug === slugify(d.title) || !d.slug)
                      ? slugify(title)
                      : d.slug,
                }));
                setDirty(true);
              }}
            />
            <div className="editor-meta">
              <div>
                <label htmlFor="story-slug">Đường dẫn câu chuyện</label>
                <div className="slug-input">
                  <span>/stories/</span>
                  <input
                    id="story-slug"
                    value={draft.slug}
                    maxLength={120}
                    onChange={(e) => change("slug", e.target.value)}
                    placeholder="mot-khoanh-khac-yen"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="story-topic">Chương</label>
                <select
                  id="story-topic"
                  value={draft.topic}
                  onChange={(e) =>
                    change("topic", e.target.value as Draft["topic"])
                  }
                >
                  {topics.map((t) => (
                    <option value={t} key={t}>
                      {topicNames[t]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <label htmlFor="story-excerpt">
              Một lời giới thiệu ngắn <span>Hiển thị trong góc đọc chuyện</span>
            </label>
            <textarea
              id="story-excerpt"
              value={draft.excerpt}
              maxLength={320}
              rows={2}
              onChange={(e) => change("excerpt", e.target.value)}
              placeholder="Một hoặc hai câu để mở đầu."
            />
            <div className="cover-editor">
              {draft.cover ? (
                <>
                  <img
                    src={draft.cover}
                    alt={draft.coverAlt || "Xem trước ảnh bìa"}
                  />
                  <div>
                    <label htmlFor="cover-alt">Mô tả ảnh bìa</label>
                    <input
                      id="cover-alt"
                      value={draft.coverAlt}
                      maxLength={300}
                      onChange={(e) => change("coverAlt", e.target.value)}
                      placeholder="Hình ảnh này có gì?"
                    />
                    <button
                      className="text-button"
                      onClick={() => {
                        change("cover", "");
                        change("coverAlt", "");
                      }}
                    >
                      Bỏ ảnh bìa
                    </button>
                  </div>
                </>
              ) : (
                <label className="file-label">
                  + Thêm ảnh bìa
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploading || busy}
                    onChange={(e) => {
                      upload(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                  <small>JPEG, PNG hoặc WebP · tối đa 5 MB</small>
                </label>
              )}
            </div>
            <div className="editor-format-bar">
              <span>
                {preview
                  ? "Bản xem trước khi đọc"
                  : "Câu chuyện · hỗ trợ Markdown"}
              </span>
              <div>
                <label className="file-link">
                  Nhập tệp .md
                  <input
                    type="file"
                    accept=".md,.txt,text/plain,text/markdown"
                    onChange={(e) => {
                      importMarkdown(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                <label className="file-link">
                  Thêm ảnh
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploading || busy}
                    onChange={(e) => {
                      upload(e.target.files?.[0], true);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>
            {preview ? (
              <div className="editor-preview">
                {draft.body ? (
                  <StoryMarkdown body={draft.body} />
                ) : (
                  <p>Những dòng bạn viết sẽ hiện ở đây.</p>
                )}
              </div>
            ) : (
              <textarea
                ref={editorRef}
                id="story-body"
                aria-label="Nội dung câu chuyện bằng Markdown"
                className="body-editor"
                value={draft.body}
                maxLength={80000}
                onChange={(e) => change("body", e.target.value)}
                placeholder={
                  "## Bắt đầu từ nơi bạn đang đứng\n\nKhông cần biết trước câu chuyện sẽ kết thúc ra sao."
                }
              />
            )}
            <details className="format-help">
              <summary>Một vài công cụ viết</summary>
              <p>
                <code>## Tiêu đề một phần</code> tạo tiêu đề.{" "}
                <code>**nội dung**</code> tạo chữ đậm.{" "}
                <code>&gt; Một ý nghĩ muốn giữ lại</code> tạo trích dẫn. Ảnh tải lên có thể chèn vào nội dung. Mã HTML không được hiển thị.
              </p>
            </details>
          </fieldset>
          <div className="editor-feedback" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.p
                key={error || notice || String(uploading)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: transition.swap }}
                transition={transition.swap}
                className={error ? "form-error" : "form-success"}
                role={error ? "alert" : undefined}
              >
                {error || notice || (uploading ? "Đang chuẩn bị ảnh…" : "")}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="editor-actions">
            <div>
              <InkButton
                className="ink-button"
                disabled={busy || uploading}
                onClick={() =>
                  save(draft.status === "published" ? "published" : "draft")
                }
              >
                {busy
                  ? "Đang lưu…"
                  : draft.status === "published"
                    ? "Lưu thay đổi"
                    : "Lưu bản nháp"}
              </InkButton>
              {draft.status !== "published" && (
                <InkButton
                  className="outline-button"
                  disabled={busy || uploading}
                  onClick={() => save("published")}
                >
                  Xuất bản ↗
                </InkButton>
              )}
            </div>
            <div>
              {draft.status === "published" && (
                <>
                  <Link
                    className="small-link"
                    href={`/stories/${draft.slug}`}
                    target="_blank"
                  >
                    Đọc bản công khai ↗
                  </Link>
                  <InkButton
                    className="reader-tool"
                    disabled={busy || uploading}
                    onClick={() => save("draft")}
                  >
                    Gỡ xuất bản
                  </InkButton>
                </>
              )}
              {draft.id && draft.status !== "archived" && (
                <InkButton
                  className="reader-tool"
                  disabled={busy || uploading}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Cất trang này vào kho? Trang sẽ ẩn khỏi góc đọc, nhưng bạn có thể khôi phục tại đây.",
                      )
                    )
                      save("archived");
                  }}
                >
                  Cất vào kho
                </InkButton>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
