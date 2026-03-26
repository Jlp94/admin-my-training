const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('ChangeDetectionStrategy.Eager')) {
        const fixed = content.replace(/ChangeDetectionStrategy\.Eager/g, 'ChangeDetectionStrategy.Default');
        fs.writeFileSync(filePath, fixed, 'utf8');
        console.log(`[Patch] Fixed ChangeDetectionStrategy in: ${filePath}`);
      }
    }
  } catch (err) {
    console.error(`Error patching ${filePath}:`, err);
  }
}

// Parchear Scroller y Table (los que están fallando)
const basePath = path.join(__dirname, 'node_modules', 'primeng', 'fesm2022');
replaceInFile(path.join(basePath, 'primeng-scroller.mjs'));
replaceInFile(path.join(basePath, 'primeng-table.mjs'));

console.log('[Patch] PrimeNG bug Eager fixed.');
