import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const base = process.env.TEST_URL || 'http://localhost:3000';
const topics = ['alone','trust','within','love','family','becoming'];
await mkdir('artifacts', { recursive:true });
const browser = await chromium.launch({channel:'chrome',headless:true});
try {
  for (const width of [390,768,1440]) {
    const page = await browser.newPage({viewport:{width,height:900}});
    const errors=[]; page.on('pageerror', e=>errors.push(e.message));
    await page.goto(base); await page.waitForSelector('.motion-ready');
    assert.equal(await page.locator('.motion-toggle').count(),0);
    assert.equal(await page.locator('.chapter-notes').count(),6);
    for (const topic of topics) {
      const note=page.locator(`.chapter-notes-${topic}`);
      await note.scrollIntoViewIfNeeded();
      await expect(note.locator('[data-fade]').last()).toHaveCSS('opacity','1');
      await note.locator('summary').click();
      await expect(note.locator('details')).toHaveAttribute('open','');
      await expect(note.locator('.chapter-read-link')).toHaveAttribute('href',`/stories?topic=${topic}`);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    }
    await page.locator('.chapter-notes-family').scrollIntoViewIfNeeded();
    await page.screenshot({path:`artifacts/chapter-notes-${width}.png`});
    await page.locator('.chapter-notes-family .chapter-read-link').click();
    await expect(page).toHaveURL(/stories\?topic=family/);
    await expect(page.locator('.topic-links [aria-current="page"]')).toContainText('Chương 5');
    assert.deepEqual(errors,[]); await page.close();
  }
  for (const options of [{reducedMotion:'reduce'},{javaScriptEnabled:false}]) {
    const page=await browser.newPage(options); await page.goto(base);
    for(const topic of topics) {
      const section=page.locator(`.chapter-notes-${topic}`);
      await section.scrollIntoViewIfNeeded();
      await expect(section.locator('[data-fade]').last()).toHaveCSS('opacity','1');
      await expect(section.locator('.chapter-read-link')).toBeVisible();
    }
    await page.close();
  }
  console.log('PASS: six chapter links, disclosures, reveal visibility, 390/768/1440, no overflow, reduced motion and no JS.');
} finally {await browser.close();}
