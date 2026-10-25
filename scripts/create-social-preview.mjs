// Code-rendered share artwork, isolated from the live app and its HMR scripts.
import { chromium } from '@playwright/test';
const base=process.env.TEST_URL||'http://localhost:3000';
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{channel:'chrome'})});
try{
 const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
 await page.route('**/__social-preview',route=>route.fulfill({contentType:'text/html',body:`<!doctype html><html><head><style>
 @font-face{font-family:hand;src:url('/fonts/patrickhand.ttf')}@font-face{font-family:marker;src:url('/fonts/pangolin.ttf')}
 *{box-sizing:border-box}body{margin:0;background:#faf9f6;color:#302e2a;padding:58px 75px}img{width:65px;height:60px}p{font:28px hand;color:#344c69}h1{font:64px marker;font-weight:400;line-height:1.3;margin:48px 0 22px}h1 span{color:#bd8e24}.foot{font:22px hand;color:#68645d;border-top:1px solid #c8c3b9;padding-top:18px;margin-top:40px}
 </style></head><body><img src="/jn-sketch.svg" alt=""><h1>Một câu chuyện,<br>vẫn <span>đang viết.</span></h1><p>Những trang nhỏ về niềm tin, nghĩ suy và lớn lên.</p><div class="foot">JN / Góc đọc chuyện</div></body></html>`}));
 await page.goto(`${base}/__social-preview`);await page.evaluate(()=>document.fonts.ready);await page.locator('img').evaluate(img=>img.decode());await page.screenshot({path:'app/opengraph-image.png'});
 console.log('Saved 1200 × 630 social artwork.');
}finally{await browser.close()}
