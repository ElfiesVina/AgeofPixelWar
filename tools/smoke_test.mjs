// Uji asap: buka game, masuk peta, tunggu, pastikan tanpa error JS.
// Pakai: node tools/smoke_test.mjs <url>   (butuh: npm i playwright)
import { chromium } from 'playwright';
const url = process.argv[2] || 'http://localhost:8000/index.html';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 420 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push('console: ' + m.text()));
await page.goto(url);
await page.getByText('ENTER WAR MAP').first().click();
await page.waitForTimeout(5000);
console.log(errors.length ? 'GAGAL:\n' + errors.join('\n') : 'OK: tanpa error');
await browser.close();
process.exit(errors.length ? 1 : 0);
