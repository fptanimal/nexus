const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  try {
    await page.locator('text=BẮT ĐẦU').first().click({ timeout: 5000 });
  } catch(e) {}
  
  await page.waitForTimeout(3000);

  await page.evaluate(() => {
    if (window.__gameStore) {
      window.__gameStore.getState().changeLocation('classroom', { x: 8, y: 12, facing: 'up' });
    }
  });
  
  await page.waitForTimeout(3000);
  
  const canvasBox = await page.locator('canvas').first().boundingBox();
  if (!canvasBox) { console.log('No canvas'); await browser.close(); return; }
  
  // Zoomed view of classmate 1 (glasses, at column 4, row 10 => top-left desks)
  await page.screenshot({ 
    path: 'C:/Users/Admin/.gemini/antigravity-ide/brain/832aa920-88a1-46af-9186-8cd24bdfbc90/zoom_classmate1.png',
    clip: { x: canvasBox.x + 100, y: canvasBox.y + 180, width: 250, height: 250 }
  });
  
  // Zoomed view of classmate 2 (pigtails, at column 12, row 10 => top-right desks)
  await page.screenshot({ 
    path: 'C:/Users/Admin/.gemini/antigravity-ide/brain/832aa920-88a1-46af-9186-8cd24bdfbc90/zoom_classmate2.png',
    clip: { x: canvasBox.x + 480, y: canvasBox.y + 180, width: 250, height: 250 }
  });
  
  // Zoomed view of classmate 3 (curly, at column 5, row 14 => mid-left desks)
  await page.screenshot({ 
    path: 'C:/Users/Admin/.gemini/antigravity-ide/brain/832aa920-88a1-46af-9186-8cd24bdfbc90/zoom_classmate3.png',
    clip: { x: canvasBox.x + 100, y: canvasBox.y + 370, width: 250, height: 250 }
  });
  
  console.log('All zoomed screenshots saved');
  await browser.close();
})();
