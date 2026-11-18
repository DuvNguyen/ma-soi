import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { ROLES } from '../src/data/roles.js';

const PUBLIC_CARDS_DIR = path.resolve('public/cards');
const AVATARS_DIR = path.resolve('public/cards/avatars');

if (!fs.existsSync(AVATARS_DIR)) {
  fs.mkdirSync(AVATARS_DIR, { recursive: true });
}

async function buildRoleArt() {
  console.log('🎨 Starting Role Art Pipeline...');
  let processed = 0;
  let errors = 0;

  for (const role of ROLES) {
    if (!role.image) {
      console.warn(`⚠️ Role ${role.id} has no image defined`);
      continue;
    }

    const cleanImgPath = role.image.startsWith('/') ? role.image.slice(1) : role.image;
    const srcPath = path.resolve('public', cleanImgPath);

    if (!fs.existsSync(srcPath)) {
      console.error(`❌ Source image not found for ${role.id}: ${srcPath}`);
      errors++;
      continue;
    }

    const cardDest = path.join(PUBLIC_CARDS_DIR, `${role.id}.webp`);
    const avatarDest = path.join(AVATARS_DIR, `${role.id}.webp`);

    try {
      // 1. Full card: 360x540 WebP (quality 82)
      await sharp(srcPath)
        .resize(360, 540, { fit: 'cover', position: 'center' })
        .webp({ quality: 82 })
        .toFile(cardDest);

      // 2. Avatar: 160x160 WebP (quality 80)
      await sharp(srcPath)
        .resize(160, 160, { fit: 'cover', position: 'attention' })
        .webp({ quality: 80 })
        .toFile(avatarDest);

      processed++;
      console.log(`  ✓ [${role.id}] -> ${role.id}.webp & avatars/${role.id}.webp`);
    } catch (err) {
      console.error(`  ❌ Error processing ${role.id}:`, err.message);
      errors++;
    }
  }

  console.log(`\n🎉 Pipeline completed: ${processed} roles processed, ${errors} errors.`);
}

buildRoleArt();
