import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:8000/index.html';
const errors = [];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => m.type() === 'error' && errors.push('console: ' + m.text()));

try {
await page.goto(url);
  await page.getByRole('heading', { name: 'AGE OF PIXEL WAR' }).first().waitFor({ timeout: 5000 });  // splash tampil
  await page.getByText('PLAY', { exact: true }).waitFor({ timeout: 8000 });                          // pindah ke Home
await page.getByText('PLAY', { exact: true }).click();
  await page.getByRole('button', { name: /MULAI PERTANDINGAN/ }).click();                            // lobi, lalu mulai
  await page.locator('canvas').first().waitFor({ timeout: 8000 });                                   // layar game
  await page.waitForTimeout(5000);                                                                    // biarkan engine berjalan
} catch (e) {
errors.push('alur gagal: ' + e.message.split('\n')[0]);
}

if (errors.length) {
await page.screenshot({ path: 'smoke-failure.png' });
}

console.log(errors.length ? 'GAGAL:\n' + errors.join('\n') : 'OK: tanpa error');
await browser.close();
process.exit(errors.length ? 1 : 0);
