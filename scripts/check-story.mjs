import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH }
    : { channel: "chrome" }),
});
const base = process.env.TEST_URL || "http://localhost:3012";
await mkdir("artifacts", { recursive: true });
const report = [];
async function position(page, id, progress) {
  await page.evaluate(
    ([id, progress]) => {
      const section = document.getElementById(id);
      const sticky = section.querySelector(".scene-inner");
      scrollTo(
        0,
        section.offsetTop +
          Math.max(
            0,
            section.offsetHeight - (sticky?.offsetHeight || innerHeight),
          ) *
            progress,
      );
    },
    [id, progress],
  );
  await page.waitForTimeout(70);
}
async function verifyFrame(page, id, progress) {
  await position(page, id, progress);
  await page.waitForFunction(
    ({ id, progress }) => {
      const v = document.querySelector(`#${id} video`);
      const target = Math.min(
        v.duration - 1 / 24,
        Math.min(
          1,
          id === "becoming"
            ? progress / 0.84
            : Math.max(0, (progress - 0.18) / 0.82),
        ) * v.duration,
      );
      return (
        v.readyState >= 2 &&
        v.paused &&
        !v.seeking &&
        Math.abs(v.currentTime - target) < 0.06
      );
    },
    { id, progress },
    { timeout: 12000 },
  );
  const time = await page
    .locator(`#${id} video`)
    .evaluate((v) => v.currentTime);
  await page.waitForTimeout(350);
  assert.equal(
    await page.locator(`#${id} video`).evaluate((v) => v.currentTime),
    time,
    `${id} must stop when scrolling stops`,
  );
  return time;
}
try {
  for (const width of [390, 768, 1440]) {
    const page = await browser.newPage({
      viewport: { width, height: width === 390 ? 844 : 900 },
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(base);
    await page.waitForSelector(".clouds-enabled");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(
      () => document.querySelector(".hero video").readyState >= 2,
    );
    assert.equal(
      await page.locator("#becoming video").getAttribute("src"),
      null,
      "Later video must not eagerly load",
    );
    await page.screenshot({ path: `artifacts/hero-${width}.png` });
    for (const [p, index] of [
      [0.1, 0],
      [0.45, 1],
      [0.8, 2],
      [0.45, 1],
      [0.1, 0],
    ]) {
      await position(page, "beginning", p);
      const values = await page
        .locator(".hero .beat")
        .evaluateAll((es) => es.map((e) => +getComputedStyle(e).opacity));
      assert(
        values[index] > 0.98 && values.filter((v) => v > 0.01).length === 1,
        "Exactly one hero pair visible in either direction",
      );
    }

    // Texture motion must be scroll-derived and reversible, with trust held at frame zero.
    await position(page, "beginning", 0.94);
    const cloudState = () =>
      page
        .locator(".cloud-bank")
        .evaluateAll((es) => es.map((e) => getComputedStyle(e).transform));
    const before = await cloudState();
    await page.waitForTimeout(300);
    assert.deepEqual(await cloudState(), before, "Cloud freezes while idle");
    await page.screenshot({ path: `artifacts/cloud-${width}.png` });
    await position(page, "trust", 0.1);
    await page.waitForTimeout(150);
    assert.equal(
      await page.locator("#trust video").evaluate((v) => v.currentTime),
      0,
      "Hands wait for clouds",
    );
    await position(page, "beginning", 0.94);
    assert.deepEqual(await cloudState(), before, "Cloud reverses precisely");
    const results = {};
    for (const id of ["trust", "becoming"]) {
      const times = [];
      for (const p of [0.1, 0.36, 0.6, 0.95, 0.3])
        times.push(await verifyFrame(page, id, p));
      // Rapid, alternating scroll destinations must converge to the final target.
      for (const p of [0.9, 0.12, 0.75, 0.2, 0.98]) await position(page, id, p);
      await verifyFrame(page, id, 0.71);
      await page.screenshot({ path: `artifacts/${id}-${width}.png` });
      results[id] = times;
    }
    const held = await verifyFrame(page, "becoming", 0.88);
    assert.equal(
      await verifyFrame(page, "becoming", 0.98),
      held,
      "Final flower holds",
    );
    await position(page, "noise", 0);
    await page.waitForTimeout(200);
    await page.screenshot({ path: `artifacts/noise-${width}.png` });
    const layout = await page.evaluate(() => {
      const a = document.querySelector(".noise-art").getBoundingClientRect();
      const b = document.querySelector(".noise-copy").getBoundingClientRect();
      return { left: a.right <= b.left + 1, above: a.bottom <= b.top + 1 };
    });
    assert(width === 390 ? layout.above : layout.left, "Noise layout order");
    for (const id of [
      "beginning",
      "trust",
      "noise",
      "becoming",
      "stories",
      "unwritten",
    ]) {
      await position(page, id, 0.5);
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        "No horizontal overflow",
      );
    }
    await position(page, "unwritten", 0);
    await page.waitForTimeout(1300);
    assert.equal(
      (await page.locator("#closing-heading").innerText()).replace(/\s+/g, " "),
      "What comes next is unwritten.",
    );
    await page.screenshot({ path: `artifacts/closing-${width}.png` });
    if (width === 390) {
      await page.locator("#menu-toggle").click();
      assert.equal(
        await page.locator("#menu-toggle").getAttribute("aria-expanded"),
        "true",
      );
    }
    await page.locator('.chapter-links a[href="#trust"]').click();
    await page.waitForTimeout(400);
    assert(
      Math.abs(
        (await page
          .locator("#trust")
          .evaluate(
            (e) =>
              -e.getBoundingClientRect().top /
              (e.offsetHeight - e.querySelector(".scene-inner").offsetHeight),
          )) - 0.18,
      ) < 0.003,
      "Navigation lands after cloud transition",
    );
    await verifyFrame(page, "trust", 0.55);
    await page.reload();
    await page.waitForSelector(".clouds-enabled");
    await page.waitForTimeout(700);
    const reloadSync = await page.locator("#trust").evaluate((e) => {
      const v = e.querySelector("video");
      const p = Math.max(
        0,
        Math.min(
          1,
          -e.getBoundingClientRect().top /
            (e.offsetHeight - e.querySelector(".scene-inner").offsetHeight),
        ),
      );
      return {
        p: Math.max(0, (p - 0.18) / 0.82),
        t: v.currentTime,
        d: v.duration,
      };
    });
    assert(
      Math.abs(reloadSync.t - reloadSync.p * reloadSync.d) < 0.08,
      "Reload sync",
    );
    assert(
      Math.abs(reloadSync.p - (0.55 - 0.18) / 0.82) < 0.01,
      "Reload preserves reading position",
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForTimeout(100);
    assert.equal(await page.locator(".enhanced").count(), 0);
    assert(
      await page
        .locator(".beat")
        .evaluateAll((es) =>
          es.every((e) => getComputedStyle(e).opacity === "1"),
        ),
    );
    assert(
      await page
        .locator("video")
        .evaluateAll((vs) => vs.every((v) => v.paused)),
    );
    await page.screenshot({
      path: `artifacts/reduced-${width}.png`,
      fullPage: true,
    });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.waitForSelector(".clouds-enabled");
    assert.deepEqual(errors, []);
    report.push({ width, passed: true, seekTimes: results, reloadSync });
    await page.close();
  }
  const nojs = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  await nojs.goto(base);
  assert(
    await nojs
      .locator(".beat")
      .evaluateAll((es) =>
        es.every((e) => getComputedStyle(e).opacity === "1"),
      ),
  );
  assert(await nojs.locator(".chapter-links a").first().isVisible());
  assert.equal(await nojs.locator(".chapter-links").evaluate(e=>getComputedStyle(e).opacity), "1");
  assert(
    await nojs.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await nojs.locator(".margin-entries details summary").first().click();
  assert.equal(await nojs.locator(".margin-entries details[open]").count(),1);
  await nojs.close();
  const errorPage = await browser.newPage();
  await errorPage.route("**/media/*.mp4", (r) => r.abort());
  await errorPage.goto(base);
  for (const id of ["beginning", "trust", "becoming"]) {
    await position(errorPage, id, 0.4);
    await errorPage.waitForSelector(`#${id}.media-failed`);
    assert.equal(await errorPage.locator(`#${id}.enhanced`).count(), 0);
    assert(
      await errorPage
        .locator(`#${id} .beat`)
        .evaluateAll((es) =>
          es.every((e) => getComputedStyle(e).opacity === "1"),
        ),
    );
    assert(
      await errorPage
        .locator(`#${id} .media .static-poster`)
        .evaluate((e) => e.complete && e.naturalWidth > 0),
    );
  }
  assert.equal(
    await errorPage.locator(".clouds-enabled").count(),
    0,
    "Video error disables transition overlap",
  );
  await errorPage.close();
  const missingTexture = await browser.newPage();
  await missingTexture.route("**/cloud-bank.webp", (r) => r.abort());
  await missingTexture.goto(base);
  await missingTexture.waitForTimeout(300);
  assert.equal(
    await missingTexture.locator(".clouds-enabled").count(),
    0,
    "Missing cloud texture uses normal scene layout",
  );
  await missingTexture.close();
  const keyboard = await browser.newPage({
    viewport: { width: 390, height: 844 },
  });
  await keyboard.goto(base);
  await keyboard.keyboard.press("Tab");
  assert.equal(
    await keyboard.evaluate(() => document.activeElement.className),
    "skip-link",
  );
  await keyboard.locator("#menu-toggle").focus();
  await keyboard.keyboard.press("Enter");
  await keyboard.keyboard.press("Tab");
  assert.equal(
    await keyboard.evaluate(() => document.activeElement.textContent),
    "Ch\u01b0\u01a1ng 1",
  );
  await keyboard.keyboard.press("Escape");
  assert.equal(
    await keyboard.locator("#menu-toggle").getAttribute("aria-expanded"),
    "false",
  );
  await keyboard.close();
  report.push({ noJavaScript: true, videoErrorFallback: true, keyboard: true });
  await writeFile(
    "artifacts/check-results.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
