import fs from 'fs';
import path from 'path';

const isStrict = process.argv.includes('--strict');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (fullPath.endsWith('.jsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const componentFiles = walk('./src/components');
const allSrcFiles = walk('./src');

const errors = {
  arbitraryFontSize: [],
  arbitraryHexInComponents: [],
  rawButtonsOutsideUi: [],
  nonSemanticClick: []
};

// 1. Cỡ chữ tự do in src/components: text-[Npx], text-[Nrem]
const fontSizeRegex = /text-\[[0-9.]+(px|rem)\]/g;
// 2. Hex tự do in src/components excluding ActionModal.jsx: (bg|text|border|from|via|to|ring|shadow)-[#...]
const hexRegex = /(bg|text|border|from|via|to|ring|shadow)-\[#[0-9a-fA-F]{3,8}\]/g;

componentFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    let m;
    while ((m = fontSizeRegex.exec(line)) !== null) {
      errors.arbitraryFontSize.push(`${f}:${idx + 1} -> ${m[0]}`);
    }
    if (!f.includes('ActionModal.jsx')) {
      while ((m = hexRegex.exec(line)) !== null) {
        errors.arbitraryHexInComponents.push(`${f}:${idx + 1} -> ${m[0]}`);
      }
    }
  });
});

// 3. Raw <button> outside src/components/ui/
allSrcFiles.forEach(f => {
  if (f.includes('src/components/ui/') || f.includes('src/components/ui\\')) return;
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('<button') && !line.includes('<GothicButton')) {
      errors.rawButtonsOutsideUi.push(`${f}:${idx + 1}`);
    }
  });
});

// 4. <div/span/a> with onClick
allSrcFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (/<(div|span|a)\b[^>]*\bonClick\b/.test(line)) {
      errors.nonSemanticClick.push(`${f}:${idx + 1}`);
    }
  });
});

console.log('--- UI LINT AUDIT SUMMARY ---');
console.log(`1. Arbitrary Font Sizes (text-[..px]): ${errors.arbitraryFontSize.length} occurrences`);
console.log(`2. Arbitrary Hex Colors (excl. ActionModal): ${errors.arbitraryHexInComponents.length} occurrences`);
console.log(`3. Raw <button> Outside UI Primitives: ${errors.rawButtonsOutsideUi.length} occurrences`);
console.log(`4. Non-Semantic onClick on div/span/a: ${errors.nonSemanticClick.length} occurrences`);

const totalViolations = 
  errors.arbitraryFontSize.length +
  errors.arbitraryHexInComponents.length +
  errors.rawButtonsOutsideUi.length +
  errors.nonSemanticClick.length;

if (totalViolations > 0) {
  if (isStrict) {
    console.error(`\n❌ Strict UI Lint Failed: ${totalViolations} violations found.`);
    process.exit(1);
  } else {
    console.log(`\n⚠️ UI Lint Guard Active (${totalViolations} violations remaining to refactor across phases).`);
  }
} else {
  console.log('\n✅ 0 UI Violations! Clean Design System compliance achieved.');
}
