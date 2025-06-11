const path = require('path');
const fs = require('fs/promises');
const sharp = require('sharp');
const fg = require('fast-glob');

// Directories to search for images. Adjust as needed.
const TARGET_DIRS = [
  path.join(__dirname, '..', 'frontend', 'public', 'assets'),
  path.join(__dirname, '..', 'frontend', 'public'),
];

const PATTERN = '**/*.{png,jpg,jpeg}';

(async () => {
  for (const dir of TARGET_DIRS) {
    const files = await fg(path.join(dir, PATTERN), { absolute: true });
    for (const inputPath of files) {
      const extIndex = inputPath.lastIndexOf('.');
      const base = inputPath.slice(0, extIndex);

      const webpPath = base + '.webp';
      const avifPath = base + '.avif';

      try {
        // Skip conversion if output already exists
        await fs.access(webpPath).catch(() => sharp(inputPath)
          .webp({ quality: 80 })
          .toFile(webpPath));

        await fs.access(avifPath).catch(() => sharp(inputPath)
          .avif({ quality: 50 })
          .toFile(avifPath));

        console.log('✅ Converted', path.relative(process.cwd(), inputPath));
      } catch (err) {
        console.error('❌ Failed', inputPath, err.message);
      }
    }
  }
})(); 