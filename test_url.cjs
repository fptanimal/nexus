const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('https://nexus-omega-khaki.vercel.app');
  // Wait for the app to load and interact
  await page.waitForTimeout(5000);
  
  // Need to walk to hospital to see the error?
  // Let's just check if there are any immediate errors.
  
  await browser.close();
})();
