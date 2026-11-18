import { createServer } from 'vite';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const targetDir = process.argv[2] || 'docs/screenshots/baseline';
const outDir = path.resolve(targetDir);
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 }
];

async function dismissAnyDialog(page) {
  try {
    const dialogBtn = page.locator('button:has-text("Đã hiểu"), button:has-text("Đóng"), button:has-text("Bỏ qua"), button:has-text("Bỏ Qua"), button:has-text("OK")').first();
    if (await dialogBtn.isVisible({ timeout: 600 })) {
      await dialogBtn.click({ force: true });
      await page.waitForTimeout(300);
    }
  } catch (e) {}
}

async function run() {
  console.log(`📸 Capturing screenshots to: ${outDir}`);
  const server = await createServer({
    server: { port: 3333, host: '127.0.0.1' },
    logLevel: 'error'
  });
  await server.listen();
  console.log('⚡ Vite dev server listening at http://127.0.0.1:3333');

  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    console.log(`\n📱 Capturing Viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2
    });
    const page = await context.newPage();

    // 1. Initial Night Phase (Cupid or Step 0)
    await page.goto('http://127.0.0.1:3333', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await dismissAnyDialog(page);
    await page.screenshot({ path: path.join(outDir, `${vp.name}_night_step1_cupid.png`) });
    console.log(`  ✓ ${vp.name}_night_step1_cupid.png`);

    // 2. Night Step: Bầy Ma Sói
    try {
      const wolfTab = page.locator('button:has-text("Bầy Ma Sói")').first();
      if (await wolfTab.isVisible({ timeout: 1000 })) {
        await wolfTab.click({ force: true });
        await page.waitForTimeout(400);
        await dismissAnyDialog(page);
        await page.screenshot({ path: path.join(outDir, `${vp.name}_night_step_wolves.png`) });
        console.log(`  ✓ ${vp.name}_night_step_wolves.png`);
      }
    } catch (e) {
      console.warn('  ⚠️ Could not capture Wolves step:', e.message);
    }

    // 3. Night Step: Tiên Tri
    try {
      const seerTab = page.locator('button:has-text("Tiên Tri")').first();
      if (await seerTab.isVisible({ timeout: 1000 })) {
        await seerTab.click({ force: true });
        await page.waitForTimeout(400);
        await dismissAnyDialog(page);
        await page.screenshot({ path: path.join(outDir, `${vp.name}_night_step_seer.png`) });
        console.log(`  ✓ ${vp.name}_night_step_seer.png`);
      }
    } catch (e) {
      console.warn('  ⚠️ Could not capture Seer step:', e.message);
    }

    // 4. Night Step: Phù Thủy
    try {
      const witchTab = page.locator('button:has-text("Phù Thủy")').first();
      if (await witchTab.isVisible({ timeout: 1000 })) {
        await witchTab.click({ force: true });
        await page.waitForTimeout(400);
        await dismissAnyDialog(page);
        await page.screenshot({ path: path.join(outDir, `${vp.name}_night_step_witch.png`) });
        console.log(`  ✓ ${vp.name}_night_step_witch.png`);
      }
    } catch (e) {
      console.warn('  ⚠️ Could not capture Witch step:', e.message);
    }

    // 5. Night Step: Tóm Tắt
    try {
      const summaryTab = page.locator('button:has-text("Tóm Tắt")').first();
      if (await summaryTab.isVisible({ timeout: 1000 })) {
        await summaryTab.click({ force: true });
        await page.waitForTimeout(400);
        await dismissAnyDialog(page);
        await page.screenshot({ path: path.join(outDir, `${vp.name}_night_step_summary.png`) });
        console.log(`  ✓ ${vp.name}_night_step_summary.png`);
      }
    } catch (e) {
      console.warn('  ⚠️ Could not capture Summary step:', e.message);
    }

    // 6. Day Phase View
    try {
      const dayTab = page.locator('button:has-text("Ban Ngày"), button:has-text("Làng Thức Giấc"), button:has-text("Làng (Ngày")').first();
      if (await dayTab.isVisible({ timeout: 1000 })) {
        await dayTab.click({ force: true });
        await page.waitForTimeout(500);
        await dismissAnyDialog(page);
        await page.screenshot({ path: path.join(outDir, `${vp.name}_day_phase_view.png`) });
        console.log(`  ✓ ${vp.name}_day_phase_view.png`);
      }
    } catch (e) {
      console.warn('  ⚠️ Could not capture Day view:', e.message);
    }

    // 7. Setup Modal - Tab 1 (Thiết Lập)
    try {
      const setupBtn = page.locator('button:has-text("Thiết Lập Ván"), button:has-text("Thiết Lập")').first();
      if (await setupBtn.isVisible({ timeout: 1000 })) {
        await setupBtn.click({ force: true });
        await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(outDir, `${vp.name}_modal_setup_tab1.png`) });
        console.log(`  ✓ ${vp.name}_modal_setup_tab1.png`);

        // Tab 2 (Kho Bộ Bài / Templates)
        const templatesTab = page.locator('button:has-text("Kho Bộ Bài")').first();
        if (await templatesTab.isVisible({ timeout: 1000 })) {
          await templatesTab.click({ force: true });
          await page.waitForTimeout(400);
          await page.screenshot({ path: path.join(outDir, `${vp.name}_modal_setup_tab2_templates.png`) });
          console.log(`  ✓ ${vp.name}_modal_setup_tab2_templates.png`);
        }

        // Close setup modal
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
      }
    } catch (e) {
      console.warn('  ⚠️ Could not capture Setup modal:', e.message);
    }

    // 8. Role Library Modal
    try {
      const libraryBtn = page.locator('button:has-text("Thư Viện")').first();
      if (await libraryBtn.isVisible({ timeout: 1000 })) {
        await libraryBtn.click({ force: true });
        await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(outDir, `${vp.name}_modal_role_library.png`) });
        console.log(`  ✓ ${vp.name}_modal_role_library.png`);

        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
      }
    } catch (e) {
      console.warn('  ⚠️ Could not capture Role Library modal:', e.message);
    }

    // 9. Match History Modal
    try {
      const historyBtn = page.locator('button:has-text("Lịch Sử")').first();
      if (await historyBtn.isVisible({ timeout: 1000 })) {
        await historyBtn.click({ force: true });
        await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(outDir, `${vp.name}_modal_match_history.png`) });
        console.log(`  ✓ ${vp.name}_modal_match_history.png`);

        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
      }
    } catch (e) {
      console.warn('  ⚠️ Could not capture Match History modal:', e.message);
    }

    await context.close();
  }

  await browser.close();
  await server.close();
  console.log(`\n🎉 Screenshots captured successfully in ${outDir}!`);
}

run().catch(err => {
  console.error('Failed to capture screenshots:', err);
  process.exit(1);
});
