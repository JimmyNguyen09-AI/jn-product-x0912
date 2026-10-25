import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const base=process.env.TEST_URL||'http://localhost:3000';
const browser=await chromium.launch({channel:'chrome',headless:true});
const ids=['home','mums-side','growing-up','dads-side'];
const captions=['My first home. My constant.','Some love stays, even when someone is no longer here.','Before we had plans, we had afternoons together.','The kind of warmth that never needed many words.'];
const report=[];
async function lovePosition(page,progress){
 await page.evaluate(p=>{const s=document.getElementById('almost-us');scrollTo(0,s.offsetTop+(s.offsetHeight-s.querySelector('.scene-inner').offsetHeight)*p)},progress);
 await page.waitForFunction(progress=>{const v=document.querySelector('#almost-us video');return v.readyState>=2&&!v.seeking&&v.paused&&Math.abs(v.currentTime-Math.min(v.duration-1/24,Math.min(1,progress/.88)*v.duration))<.06},progress);
 await page.waitForTimeout(80);
}
async function selected(page,id){
 await expect(page.locator('.album-stage')).toHaveAttribute('aria-busy','false');
 await expect(page.locator('.album-photo.is-front')).toHaveAttribute('data-memory',id);
 await expect(page.locator('.memory-caption')).toHaveAttribute('data-active-memory',id);
 assert.equal((await page.locator('.memory-caption>p:last-child').textContent()).trim(),captions[ids.indexOf(id)]);
 assert.equal(await page.locator('.album-photo').count(),4);
}
try{
 for(const width of [390,768,1440]){
  const context=await browser.newContext({viewport:{width,height:900},hasTouch:width===390});
  const page=await context.newPage(),errors=[],largeRequests=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('request',r=>{if(/(d9371ef0|3bab7d7f|2ceea3e0|1ed7e378).*\.png/.test(r.url()))largeRequests.push(r.url())});
  await page.goto(base);await page.waitForSelector('.clouds-enabled');await page.evaluate(()=>document.fonts.ready);
  for(const p of [.1,.36,.65,.95,.36]){await lovePosition(page,p);const t=await page.locator('#almost-us video').evaluate(v=>v.currentTime);await page.waitForTimeout(250);assert.equal(await page.locator('#almost-us video').evaluate(v=>v.currentTime),t);}
  await lovePosition(page,.1);await page.screenshot({path:`artifacts/love-together-${width}.png`});await lovePosition(page,.36);await page.screenshot({path:`artifacts/love-fading-${width}.png`});await lovePosition(page,.8);await page.screenshot({path:`artifacts/love-alone-${width}.png`});
  await lovePosition(page,.9);const hold=await page.locator('#almost-us video').evaluate(v=>v.currentTime);await lovePosition(page,.96);assert.equal(await page.locator('#almost-us video').evaluate(v=>v.currentTime),hold);
  assert.equal(await page.locator('#almost-us [data-thread], #family [data-thread]').count(),0);
  const media=await page.locator('.love .media').boundingBox();assert(Math.abs(media.width-(width-15))<20&&media.height>=890,'Love media fills the viewport container');
  await lovePosition(page,.65);await page.reload();await page.waitForSelector('.clouds-enabled');await page.waitForFunction(()=>{const s=document.getElementById('almost-us'),v=s.querySelector('video');const p=-s.getBoundingClientRect().top/(s.offsetHeight-s.querySelector('.scene-inner').offsetHeight);return v.readyState>=2&&!v.seeking&&Math.abs(v.currentTime-Math.min(1,p/.88)*v.duration)<.08});
  await page.locator('.album-stage').scrollIntoViewIfNeeded();await page.waitForTimeout(250);await selected(page,'home');assert.equal(largeRequests.length,0,'Original images should not load before opening the viewer');
  await page.screenshot({path:`artifacts/family-home-${width}.png`});
  // All three rear photos have independently clickable exposed paper.
  for(let index=1;index<4;index++){
   const point=await page.locator(`.album-photo[data-memory="${ids[index]}"]`).evaluate(button=>{const r=button.getBoundingClientRect();for(let y=Math.max(100,r.top+3);y<Math.min(innerHeight-10,r.bottom);y+=5)for(let x=Math.max(4,r.left+3);x<Math.min(innerWidth-5,r.right);x+=5){if(document.elementFromPoint(x,y)?.closest('.album-photo')===button)return{x,y}}return null});
   assert(point,`Rear photo ${ids[index]} must have an exposed clickable edge`);
   await page.mouse.click(point.x,point.y);await selected(page,ids[index]);
  }
  const y=await page.evaluate(()=>scrollY);
  // Last intent wins while one photo is moving; no overlapping reorder animation.
  await page.getByRole('button',{name:'Chọn ảnh Home',exact:true}).click();await page.getByRole('button',{name:'Chọn ảnh Mum’s side',exact:true}).click();await page.getByRole('button',{name:'Chọn ảnh Growing up',exact:true}).click();await page.getByRole('button',{name:'Chọn ảnh Dad’s side',exact:true}).click();await selected(page,'dads-side');assert.equal(await page.evaluate(()=>scrollY),y);
  await page.screenshot({path:`artifacts/family-selected-${width}.png`});
  const front=page.locator('.album-photo.is-front');await front.click();await expect(page.locator('dialog')).toBeVisible();assert.equal(await page.evaluate(()=>document.documentElement.style.overflow),'hidden');
  await page.locator('.viewer-original').evaluate(img=>img.decode());await page.waitForTimeout(200);await page.screenshot({path:`artifacts/family-viewer-${width}.png`});
  assert(await page.locator('.memory-viewer').evaluate(e=>e.contains(document.activeElement)));
  await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#viewer-caption').textContent(),captions[0]);await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('#viewer-caption').textContent(),captions[3]);
  for(let i=0;i<6;i++){await page.keyboard.press('Tab');assert(await page.locator('dialog').evaluate(e=>e.contains(document.activeElement)))}
  await page.keyboard.press('Escape');await expect(page.locator('dialog')).not.toBeVisible();assert.equal(await page.evaluate(()=>scrollY),y);assert(await front.evaluate(e=>e===document.activeElement));assert.equal(await page.evaluate(()=>document.documentElement.style.overflow),'');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(width===390)await page.locator('#menu-toggle').click();await page.locator('.chapter-links a[href="#family"]').click();await page.waitForTimeout(150);assert.equal(await page.locator('.chapter-links a[aria-current]').getAttribute('href'),'#family');
  if(width===390){
   await lovePosition(page,.65);assert.equal(await page.locator('#almost-us video').evaluate(v=>v.videoWidth),680);
   await page.setViewportSize({width:768,height:900});await page.waitForFunction(()=>{const v=document.querySelector('#almost-us video');return v.readyState>=2&&v.videoWidth===1280&&!v.seeking});
   await page.setViewportSize({width:390,height:900});await page.waitForFunction(()=>{const v=document.querySelector('#almost-us video');return v.readyState>=2&&v.videoWidth===680&&!v.seeking});await lovePosition(page,.65);
  }
  await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('.enhanced')).toHaveCount(0);await page.locator('.album-stage').scrollIntoViewIfNeeded();await page.getByRole('button',{name:'Chọn ảnh Home',exact:true}).click();await selected(page,'home');await page.getByRole('button',{name:'Chọn ảnh Mum’s side',exact:true}).click();await selected(page,'mums-side');
  assert(await page.locator('#almost-us .beat').evaluateAll(es=>es.every(e=>getComputedStyle(e).opacity==='1')));assert(await page.locator('#almost-us video').evaluate(v=>v.paused));assert.deepEqual(errors,[]);
  await context.close();report.push({width,loveScrubbing:true,hold:true,reload:true,exposedEdges:true,rapidSelection:true,caption:true,lightbox:true,keyboard:true,scrollAndFocusRestore:true,reducedMotion:true});
 }
 const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await nojs.goto(base);assert.equal(await nojs.locator('.album-nojs figure').count(),4);await expect(nojs.locator('.album-nojs')).toBeVisible();assert(await nojs.locator('#almost-us .beat').evaluateAll(es=>es.every(e=>getComputedStyle(e).opacity==='1')));assert(await nojs.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await nojs.close();
 const failure=await browser.newPage({viewport:{width:390,height:844}});await failure.route('**/media/love*.mp4',r=>r.abort());await failure.goto(base+'/#almost-us');await expect(failure.locator('#almost-us')).toHaveClass(/media-failed/);assert.equal(await failure.locator('#almost-us.enhanced').count(),0);await expect(failure.locator('#almost-us .static-poster')).toBeVisible();await failure.close();
 report.push({noJavaScript:true,loveErrorFallback:true});await writeFile('artifacts/family-results.json',JSON.stringify(report,null,2));console.log(report);
}finally{await browser.close()}
