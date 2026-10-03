const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  try { await page.locator('text=BẮT ĐẦU').first().click({ timeout: 5000 }); } catch(e) {}
  await page.waitForTimeout(1000);

  // Position at LEFT wall (x=33.5 to push against x=34)
  await page.evaluate(() => {
    window.__gameStore.getState().changeLocation('main', { x: 33.5, y: 11, facing: 'right' });
  });
  await page.waitForTimeout(1000);
  await page.keyboard.down('d');
  await page.waitForTimeout(500);
  await page.keyboard.up('d');
  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity-ide/brain/832aa920-88a1-46af-9186-8cd24bdfbc90/library_left_wall.png' });
  
  // Position at DOOR (x=37, y=14 facing up)
  await page.evaluate(() => {
    window.__gameStore.getState().changeLocation('main', { x: 37, y: 14, facing: 'up' });
  });
  await page.waitForTimeout(1000);
  await page.keyboard.down('w');
  await page.waitForTimeout(1500);
  await page.keyboard.up('w');
  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity-ide/brain/832aa920-88a1-46af-9186-8cd24bdfbc90/library_door.png' });

  // Wide shot
  await page.evaluate(() => {
    window.__gameStore.getState().changeLocation('main', { x: 37, y: 16, facing: 'up' });
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity-ide/brain/832aa920-88a1-46af-9186-8cd24bdfbc90/library_wide.png' });

  console.log('Done');
  await browser.close();
})();
