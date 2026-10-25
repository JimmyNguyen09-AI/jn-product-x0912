import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.TEST_URL||'http://localhost:3012',results=[];
async function go(page,id,time){
 await page.locator(`#${id}`).evaluate(s=>scrollTo(0,s.offsetTop+100));
 await page.waitForFunction(id=>Number.isFinite(document.querySelector(`#${id} video`).duration),id);
 await page.evaluate(({id,time})=>{const s=document.getElementById(id);const v=s.querySelector('video');const progress=id==='trust'?.18+.82*time/v.duration:.84*time/v.duration;scrollTo(0,s.offsetTop+(s.offsetHeight-s.querySelector('.scene-inner').offsetHeight)*progress)}, {id,time});
 await page.waitForFunction(({id,time})=>{const v=document.querySelector(`#${id} video`);return v.readyState>=2&&!v.seeking&&Math.abs(v.currentTime-time)<.06},{id,time});
 await page.waitForTimeout(100);
}
try{
 for(const width of [390,768,1440]){
  const p=await browser.newPage({viewport:{width,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base);await p.waitForSelector('.clouds-enabled');await p.evaluate(()=>document.fonts.ready);assert.equal(await p.locator('html').getAttribute('lang'),'vi');await p.screenshot({path:`artifacts/vi-hero-${width}.png`});
  assert.deepEqual(await p.locator('.chapter-links a').allTextContents(),['Chương 1','Chương 2','Chương 3','Chương 4','Chương 5','Chương 6','Góc đọc']);
  await go(p,'trust',4.1);await expect(p.locator('.thread-trust')).toHaveAttribute('data-broken','false');await p.screenshot({path:`artifacts/thread-joined-${width}.png`});
  await go(p,'trust',4.8);await expect(p.locator('.thread-trust')).toHaveAttribute('data-broken','true');const broken=await p.locator('.thread-trust').innerHTML();await p.waitForTimeout(450);assert.equal(await p.locator('.thread-trust').innerHTML(),broken);await p.screenshot({path:`artifacts/thread-broken-${width}.png`});
  await go(p,'trust',4.1);await expect(p.locator('.thread-trust')).toHaveAttribute('data-broken','false');await go(p,'trust',4.8);assert.equal(await p.locator('.thread-trust').innerHTML(),broken);
  await p.reload();await p.waitForSelector('.clouds-enabled');await expect(p.locator('.thread-trust')).toHaveAttribute('data-broken','true');await p.waitForFunction(()=>{const v=document.querySelector('#trust video');return !v.seeking&&Math.abs(v.currentTime-4.8)<.08});
  await go(p,'becoming',2);const vars=()=>p.locator('.thread-bloom').evaluate(e=>[e.style.getPropertyValue('--thread-gold'),e.style.getPropertyValue('--thread-open')]);assert.deepEqual(await vars(),['0','0']);await p.screenshot({path:`artifacts/thread-wilted-${width}.png`});
  await go(p,'becoming',5);const blooming=await vars();assert(Number(blooming[0])>0&&Number(blooming[0])<1);await p.waitForTimeout(450);assert.deepEqual(await vars(),blooming);await p.screenshot({path:`artifacts/thread-bloom-${width}.png`});await go(p,'becoming',9);assert.deepEqual(await vars(),['1','1']);await go(p,'becoming',2);assert.deepEqual(await vars(),['0','0']);
  for(const t of [9,2,8,1,9]){await p.evaluate(t=>{const s=document.getElementById('becoming');scrollTo(0,s.offsetTop+(s.offsetHeight-s.querySelector('.scene-inner').offsetHeight)*.84*t/10)},t);await p.waitForTimeout(15)}
  await p.waitForFunction(()=>{const e=document.querySelector('.thread-bloom');return e.style.getPropertyValue('--thread-gold')==='1'&&e.style.getPropertyValue('--thread-open')==='1'});
  for(const selector of ['#noise','.quiet-pause','.new-pages','#stories','#unwritten']){await p.locator(selector).scrollIntoViewIfNeeded();await p.waitForTimeout(450);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:`artifacts/vi-${selector.replace(/[#.]/g,'')}-${width}.png`});}
  assert.equal((await p.locator('#closing-heading').innerText()).replace(/\s+/g,' '),'What comes next is unwritten.');
  await p.goto(base+'/stories');await p.evaluate(()=>document.fonts.ready);assert.equal(await p.locator('.story-row').count(),4);await p.screenshot({path:`artifacts/vi-library-${width}.png`});assert(!(await p.locator('body').innerText()).includes('min read'));assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await p.goto(base);await p.waitForSelector('.clouds-enabled');await p.locator('.motion-toggle').click();await p.waitForFunction(()=>document.querySelector('.hero video').readyState>=2);const fog=async(t)=>{await p.locator('.hero video').evaluate((v,t)=>{v.pause();v.currentTime=t},t);await p.waitForFunction(()=>!document.querySelector('.hero video').seeking);await p.waitForTimeout(80);return Number(await p.locator('.loop-fog').evaluate(e=>e.style.opacity))};
  assert((await fog(4))<.01);assert((await fog(8.15))>.8);await p.screenshot({path:`artifacts/fog-end-${width}.png`});assert((await fog(.04))>.9);assert((await fog(1))<.01);
  await p.emulateMedia({reducedMotion:'reduce'});await expect(p.locator('.story-thread').first()).toBeHidden();await expect(p.locator('.loop-fog')).toBeHidden();await expect(p.locator('.enhanced')).toHaveCount(0);assert.deepEqual(errors,[]);await p.close();results.push({width,threadReversible:true,decodedFrameSync:true,idleFrozen:true,fogTimeline:true,Vietnamese:true,reducedMotion:true});
 }
 await writeFile('artifacts/thread-results.json',JSON.stringify(results,null,2));console.log(results);
}finally{await browser.close()}
