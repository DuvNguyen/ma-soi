import { chromium, devices } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('docs/mobile_screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const TEST_DEVICES = [
  { name: 'iPhone SE', device: devices['iPhone SE'] },
  { name: 'iPhone 14 Pro', device: devices['iPhone 14 Pro'] || { viewport: { width: 393, height: 852 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)' } },
  { name: 'Galaxy S21', device: { viewport: { width: 360, height: 800 }, userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-G991B)' } },
  { name: 'Pixel 7', device: devices['Pixel 7'] || { viewport: { width: 412, height: 915 }, userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7)' } },
  { name: 'iPad Mini', device: devices['iPad Mini'] || { viewport: { width: 768, height: 1024 }, userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)' } }
];

async function runMobileAudit() {
  console.log('🚀 Starting Mobile Device Responsiveness & Wolf Whisper Box Test...\n');
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const item of TEST_DEVICES) {
    console.log(`📱 Testing on ${item.name} (${item.device.viewport.width}x${item.device.viewport.height})...`);
    const context = await browser.newContext({
      ...item.device,
      deviceScaleFactor: 2
    });
    const page = await context.newPage();

    // 1. Navigate to home
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });

    // Check horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    console.log(`   Overflow Check: ${hasHorizontalOverflow ? '❌ OVERFLOW' : '✅ NO HORIZONTAL SCROLL'}`);

    // Take screenshot of Night Step 1 (Cupid)
    const slug = item.name.toLowerCase().replace(/\s+/g, '_');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${slug}_night_step1.png`), fullPage: false });

    // 2. Click specifically on the stepper tab for "Bầy Ma Sói (Săn Mồi)"
    const wolfStepTab = page.locator('button:has-text("Bầy Ma Sói")').first();
    if (await wolfStepTab.isVisible()) {
      await wolfStepTab.click();
      await page.waitForTimeout(500);
    } else {
      // Fallback: click next until reaching Bầy Ma Sói
      for (let s = 0; s < 10; s++) {
        const stepHeader = await page.locator('h3').first().textContent().catch(() => '');
        if (stepHeader && stepHeader.includes('Bầy Ma Sói')) {
          break;
        }
        const nextBtn = page.getByRole('button', { name: /Ngủ & Tiếp/i });
        if (await nextBtn.isVisible()) {
          await nextBtn.click();
          await page.waitForTimeout(300);
        }
      }
    }

    const currentTitle = await page.locator('h3').first().textContent().catch(() => '');
    console.log(`   Current Step Title: "${currentTitle?.trim()}"`);

    // Check Wolf Whisper Box visibility
    const wolfBoxVisible = await page.locator('text=HỘP NHẮN TIN BÍ MẬT CỦA BẦY SÓI').isVisible();
    const timerVisible = await page.locator('text=25s').first().isVisible().catch(() => false);

    console.log(`   Wolf Whisper Box: ${wolfBoxVisible ? '✅ VISIBLE' : '❌ NOT VISIBLE'}`);
    console.log(`   25s Countdown Timer: ${timerVisible ? '✅ VISIBLE' : '❌ NOT VISIBLE'}`);

    // Test timer toggle setting
    const settingsBtn = page.locator('[data-testid="wolf-timer-settings-btn"]');
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
      await page.waitForTimeout(200);
      const isSettingsOpen = await page.locator('text=Cài đặt thời gian chuyền máy').isVisible();
      console.log(`   Settings Popover Toggle: ${isSettingsOpen ? '✅ WORKING' : '❌'}`);

      // Change to 25s explicitly
      const twentyFiveSecsBtn = page.locator('button:has-text("25 giây")').first();
      if (await twentyFiveSecsBtn.isVisible()) {
        await twentyFiveSecsBtn.click();
        await page.waitForTimeout(200);
      }
      // Close settings
      await settingsBtn.click();
    }

    // Test Wolf Whisper inputs
    const wolfQuickPill = page.locator('button:has-text("Cắn người này đi")').first();
    if (await wolfQuickPill.isVisible()) {
      await wolfQuickPill.click();
    }

    // Take screenshot of Wolf Whisper Box
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${slug}_wolf_whisper_box.png`), fullPage: false });

    // Test sending message and passing to next wolf
    const sendNextBtn = page.locator('button:has-text("Gửi Tin & Chuyền Cho Sói Kế Tiếp")').first();
    if (await sendNextBtn.isVisible()) {
      await sendNextBtn.click();
      await page.waitForTimeout(300);
      const logEntry = await page.locator('text=Lịch Sử Nhắn Tin Của Bầy Sói').isVisible();
      console.log(`   Wolf Message Sent & Hand-off: ${logEntry ? '✅ SUCCESS' : '❌'}`);
    }

    // Switch to Sơ Đồ Bàn Chơi (Players Grid)
    const gridTab = page.locator('button:has-text("Sơ Đồ Bàn Chơi")').first();
    if (await gridTab.isVisible()) {
      await gridTab.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${slug}_players_grid.png`), fullPage: false });
    }

    results.push({
      device: item.name,
      viewport: `${item.device.viewport.width}x${item.device.viewport.height}`,
      noHorizontalOverflow: !hasHorizontalOverflow,
      wolfBoxVisible,
      timerVisible
    });

    await context.close();
  }

  await browser.close();

  console.log('\n📊 AUDIT SUMMARY:');
  console.table(results);
}

runMobileAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
