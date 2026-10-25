import { z } from "zod";
import { topics } from "./types";
import { HttpError } from "./http";
import { db } from "./db";
export const storyInput = z
  .object({
    title: z.string().trim().min(1).max(160),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    excerpt: z.string().trim().min(1).max(320),
    body: z.string().trim().min(1).max(80000),
    topic: z.enum(topics),
    status: z.enum(["draft", "published", "archived"]),
    cover: z.string().max(160).default(""),
    coverAlt: z.string().trim().max(300).default(""),
    version: z.number().int().positive().optional(),
  })
  .strict();
export function validateStory(value: unknown) {
  const result = storyInput.safeParse(value);
  if (!result.success)
    throw new HttpError(
      400,
      result.error.issues.map(i => {
        const field=String(i.path[0]);
        const labels:Record<string,string>={title:"Tiêu đề (1–160 ký tự)",slug:"Đường dẫn (chữ thường không dấu, số và dấu gạch nối)",excerpt:"Lời giới thiệu (1–320 ký tự)",body:"Nội dung (1–80.000 ký tự)",topic:"Chương",status:"Trạng thái",cover:"Ảnh bìa",coverAlt:"Mô tả ảnh (tối đa 300 ký tự)",version:"Phiên bản trang viết"};
        return `Vui lòng kiểm tra: ${labels[field] || "dữ liệu gửi lên"}.`;
      }).join(" "),
    );
  const data = result.data;
  if (data.cover && !data.coverAlt)
    throw new HttpError(
      400,
      "Hãy mô tả ảnh bìa để người dùng trình đọc màn hình có thể hiểu nội dung.",
    );
  const assets = [
    data.cover,
    ...Array.from(
      data.body.matchAll(/\/media\/uploads\/([a-f0-9-]+)\.webp/g),
      (m) => m[0],
    ),
  ].filter(Boolean);
  for (const asset of assets) {
    const match = /^\/media\/uploads\/([a-f0-9-]{36})\.webp$/.exec(asset);
    if (
      !match ||
      !db().prepare("SELECT id FROM uploads WHERE id=?").get(match[1])
    )
      throw new HttpError(
        400,
        "Chọn ảnh đã tải lên qua bàn viết.",
      );
  }
  return data;
}
