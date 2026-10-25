import { randomUUID } from "node:crypto";
import sharp, { type OutputInfo } from "sharp";
import { db } from "@/lib/db";
import {
  requireAdmin,
  readBody,
  response,
  errorResponse,
  HttpError,
} from "@/lib/http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const bytes = await readBody(request, 6 * 1024 * 1024);
    const form = await new Response(bytes, {
      headers: { "Content-Type": request.headers.get("content-type") || "" },
    }).formData().catch(()=>{throw new HttpError(400,'Vui lòng gửi tệp ảnh hợp lệ.');});
    const file = form.get("file");
    if (!(file instanceof File) || file.size > 5 * 1024 * 1024)
      throw new HttpError(400, "Chọn ảnh JPEG, PNG hoặc WebP dưới 5 MB.");
    let image: Buffer;
    let info: OutputInfo;
    try {
      const input = Buffer.from(await file.arrayBuffer());
      const jpeg=input.subarray(0,3).equals(Buffer.from([0xff,0xd8,0xff]));
      const png=input.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
      const webp=input.subarray(0,4).toString()==='RIFF'&&input.subarray(8,12).toString()==='WEBP';
      if(!jpeg&&!png&&!webp)throw new Error('Unsupported signature');
      const metadata = await sharp(input, {
        limitInputPixels: 24_000_000,
      }).metadata();
      if (!["jpeg", "png", "webp"].includes(metadata.format || ""))
        throw new Error("Unsupported image");
      const result = await sharp(input, { limitInputPixels: 24_000_000 })
        .rotate()
        .resize({
          width: 1800,
          height: 1800,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer({ resolveWithObject: true });
      image = result.data;
      info = result.info;
    } catch {
      throw new HttpError(
        400,
        "Không đọc được ảnh này. Chọn JPEG, PNG hoặc WebP dưới 24 megapixel.",
      );
    }
    const id = randomUUID(), filename = `${id}.webp`;
    await db().prepare("INSERT INTO uploads(id,filename,width,height,createdAt,content) VALUES(?,?,?,?,?,?)").run(id,filename,info.width,info.height,new Date().toISOString(),image);
    return response(
      {
        url: `/media/uploads/${filename}`,
        width: info.width,
        height: info.height,
      },
      201,
    );
  } catch (e) {
    return errorResponse(e);
  }
}
