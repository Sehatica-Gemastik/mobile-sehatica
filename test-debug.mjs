import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  console.log('Navigating...');
  await page.goto('http://localhost:8081/');
  console.log('Waiting for load...');
  try {
    // Wait until network is idle
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  } catch(e) {
    console.log('Network idle timeout');
  }
  const content = await page.content();
  console.log('HTML CONTENT (first 2000 chars):');
  console.log(content.substring(0, 2000));
  
  await browser.close();
})();
