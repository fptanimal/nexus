const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  // Setting a specific directory for the video
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 }
  });
  const page = await context.newPage();
  
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  try {
    await page.locator('text=BẮT ĐẦU').first().click({ timeout: 5000 });
  } catch(e) {}
  
  await page.waitForTimeout(2000);

  // Move to classroom
  await page.evaluate(() => {
    if (window.__gameStore) {
      window.__gameStore.getState().changeLocation('classroom', { x: 19.5, y: 15, facing: 'up' });
    } else {
      // Import dynamic store as fallback
      import('/src/store/useGameStore.js').then(m => {
        (m.default || m.useGameStore).getState().changeLocation('classroom', { x: 19.5, y: 15, facing: 'up' });
      }).catch(e => console.log('Import failed:', e));
    }
  });
  
  await page.waitForTimeout(2000);
  
  // Take first screenshot
  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity-ide/brain/832aa920-88a1-46af-9186-8cd24bdfbc90/wander_1.png' });
  
  // Wait 4 seconds for them to wander
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity-ide/brain/832aa920-88a1-46af-9186-8cd24bdfbc90/wander_2.png' });
  
  // Wait another 4 seconds
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity-ide/brain/832aa920-88a1-46af-9186-8cd24bdfbc90/wander_3.png' });
  
  console.log('Wandering screenshots saved');
  await browser.close();
})();
